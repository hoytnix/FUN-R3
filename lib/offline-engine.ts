import {
  Card,
  Suit,
  TrickCard,
  RoundNumber,
  SolitaireBoard,
  SolitairePlacement,
  Player,
} from './types';
import {
  createDeck,
  dealHands,
  createInitialSolitaireBoard,
} from './game-engine';
import {
  saveOfflineState,
  loadOfflineState,
  clearOfflineState,
  DEFAULT_AVATARS,
} from './offline/offline-storage';
import { getNextSolitaireSeat, passOfflineSolitaire } from './offline/offline-solitaire';
import { handleOfflineTrickPlay } from './offline/offline-trick-play';
import { handleOfflineSolitairePlay } from './offline/offline-solitaire-play';

export type OfflineGameStatus =
  | 'SETUP'
  | 'PASS_SHIELD'
  | 'PLAYER_TURN'
  | 'TRICK_EVALUATION'
  | 'ROUND_END'
  | 'GAME_OVER';

export interface OfflineGameState {
  status: OfflineGameStatus;
  currentRound: RoundNumber;
  players: Player[];
  activeSeatIndex: number;
  turnTimerSeconds?: number;
  turnDeadline?: number;
  hands: Record<string, Card[]>;
  leadSuit: Suit | null;
  currentTrick: TrickCard[];
  trickLeaderSeat: number;
  lastCompletedTrick: {
    cards: TrickCard[];
    winnerPlayerId: string;
    winnerSeatIndex: number;
    pointsAwarded: number;
    roundNumber: RoundNumber;
  } | null;
  scores: Record<string, number[]>;
  totalScores: Record<string, number>;
  solitaireBoard: SolitaireBoard;
  solitairePlacements: SolitairePlacement[];
  solitairePassedSeats: number[];
  lastActionMessage: string;
  manualShieldActive: boolean;
  consecutiveSolitairePasses: number;
}

export {
  saveOfflineState,
  loadOfflineState,
  clearOfflineState,
  DEFAULT_AVATARS,
  getNextSolitaireSeat,
  passOfflineSolitaire,
};

export function initOfflineGame(
  playerNames: string[],
  avatars: string[] = ['👑', '🦊', '⚡', '🐉'],
  turnTimerSeconds: number = 40
): OfflineGameState {
  const players: Player[] = playerNames.slice(0, 4).map((name, i) => ({
    id: `local-player-${i}`,
    name: name.trim() || `Player ${i + 1}`,
    avatar: avatars[i] || DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
    seatIndex: i,
    isHost: i === 0,
    isBot: false,
    connected: true,
    lastSeen: Date.now(),
  }));

  const scores: Record<string, number[]> = {};
  const totalScores: Record<string, number> = {};

  players.forEach((p) => {
    scores[p.id] = [0, 0, 0, 0];
    totalScores[p.id] = 0;
  });

  const state: OfflineGameState = {
    status: 'SETUP',
    currentRound: 1,
    players,
    activeSeatIndex: 0,
    turnTimerSeconds,
    turnDeadline: 0,
    hands: {},
    leadSuit: null,
    currentTrick: [],
    trickLeaderSeat: 0,
    lastCompletedTrick: null,
    scores,
    totalScores,
    solitaireBoard: createInitialSolitaireBoard(),
    solitairePlacements: [],
    solitairePassedSeats: [],
    lastActionMessage: 'New local match created! Pass phone to Player 1.',
    manualShieldActive: false,
    consecutiveSolitairePasses: 0,
  };

  return startOfflineRound(state, 1);
}

export function startOfflineRound(
  currentState: OfflineGameState,
  roundNumber: RoundNumber
): OfflineGameState {
  const deck = createDeck();
  const handsRaw = dealHands(deck);

  const hands: Record<string, Card[]> = {};
  currentState.players.forEach((p) => {
    hands[p.id] = handsRaw[p.seatIndex.toString()] || [];
  });

  let startingSeat = 0;

  if (roundNumber === 4) {
    for (const p of currentState.players) {
      const pHand = hands[p.id] || [];
      if (pHand.some((c) => c.suit === 'HEARTS' && c.value === 7)) {
        startingSeat = p.seatIndex;
        break;
      }
    }
  }

  const updated: OfflineGameState = {
    ...currentState,
    status: 'PASS_SHIELD',
    currentRound: roundNumber,
    activeSeatIndex: startingSeat,
    hands,
    leadSuit: null,
    currentTrick: [],
    trickLeaderSeat: startingSeat,
    lastCompletedTrick: null,
    solitaireBoard: createInitialSolitaireBoard(),
    solitairePlacements: [],
    solitairePassedSeats: [],
    consecutiveSolitairePasses: 0,
    manualShieldActive: false,
    lastActionMessage: `Round ${roundNumber} Started! Hand pass shield engaged.`,
  };

  saveOfflineState(updated);
  return updated;
}

export function dismissOfflineShield(state: OfflineGameState): OfflineGameState {
  const timerMs = (state.turnTimerSeconds || 40) * 1000;
  const updated: OfflineGameState = {
    ...state,
    status: 'PLAYER_TURN',
    turnDeadline: Date.now() + timerMs,
    manualShieldActive: false,
  };
  saveOfflineState(updated);
  return updated;
}

export function toggleOfflineManualShield(state: OfflineGameState): OfflineGameState {
  const updated: OfflineGameState = {
    ...state,
    manualShieldActive: !state.manualShieldActive,
  };
  saveOfflineState(updated);
  return updated;
}

export function playOfflineCard(
  state: OfflineGameState,
  playerId: string,
  card: Card
): OfflineGameState {
  const activePlayer = state.players.find((p) => p.seatIndex === state.activeSeatIndex);
  if (!activePlayer || activePlayer.id !== playerId) return state;

  const hand = state.hands[playerId] || [];
  if (!hand.some((c) => c.id === card.id)) return state;

  const newHand = hand.filter((c) => c.id !== card.id);
  const updatedHands = { ...state.hands, [playerId]: newHand };

  if (state.currentRound <= 3) {
    return handleOfflineTrickPlay(state, activePlayer, playerId, card, updatedHands);
  }

  return handleOfflineSolitairePlay(state, activePlayer, playerId, card, updatedHands);
}

export function resolveOfflineTrick(state: OfflineGameState): OfflineGameState {
  if (!state.lastCompletedTrick) return state;

  const allHandsEmpty = Object.values(state.hands).every((h) => h.length === 0);
  const isSuddenDeath =
    state.currentRound === 3 && state.lastCompletedTrick.pointsAwarded === 50;
  const endRoundNow = allHandsEmpty || isSuddenDeath;

  const nextStatus: OfflineGameStatus = endRoundNow ? 'ROUND_END' : 'PASS_SHIELD';

  const updated: OfflineGameState = {
    ...state,
    status: nextStatus,
    leadSuit: null,
    currentTrick: [],
  };

  saveOfflineState(updated);
  return updated;
}

export function advanceOfflineRound(state: OfflineGameState): OfflineGameState {
  if (state.currentRound < 4) {
    return startOfflineRound(state, (state.currentRound + 1) as RoundNumber);
  }

  const updated: OfflineGameState = {
    ...state,
    status: 'GAME_OVER',
    lastActionMessage: '🏆 Match Completed! Check final standings!',
    manualShieldActive: false,
  };

  saveOfflineState(updated);
  return updated;
}
