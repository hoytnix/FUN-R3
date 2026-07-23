import { Card, Suit, Player } from '../types';
import { ReplayActionLog, MatchRecord } from '../types/replay';
import { computeStateHash } from './replay-hash';

const MATCH_HISTORY_STORAGE_KEY = 'FUN_MATCH_HISTORY';
const MAX_MATCH_HISTORY_COUNT = 20;

export function getMatchHistory(): MatchRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as MatchRecord[];
    }
  } catch (err) {
    console.error('Failed to parse match history from localStorage', err);
  }
  return [];
}

export function saveMatchToStorage(record: MatchRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMatchHistory();
    const filtered = history.filter((m) => m.id !== record.id);
    const updated = [record, ...filtered].slice(0, MAX_MATCH_HISTORY_COUNT);
    localStorage.setItem(MATCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save match record to localStorage', err);
  }
}

export function deleteMatchRecord(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getMatchHistory();
    const updated = history.filter((m) => m.id !== id);
    localStorage.setItem(MATCH_HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete match record', err);
  }
}

export function clearAllMatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MATCH_HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear match history', err);
  }
}

/**
 * Generates a realistic, deterministic 4-round Championship Match Record
 * for testing and immediate replay playback.
 */
export function generateDemoMatchRecord(): MatchRecord {
  const players: Player[] = [
    { id: 'p0', name: 'You (Champion)', avatar: '👑', seatIndex: 0, isHost: true, isBot: false, connected: true, lastSeen: Date.now() },
    { id: 'p1', name: 'Alex', avatar: '🦊', seatIndex: 1, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    { id: 'p2', name: 'Sam', avatar: '⚡', seatIndex: 2, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    { id: 'p3', name: 'Bot Alpha', avatar: '🐉', seatIndex: 3, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
  ];

  const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const createSeededHand = (seat: number, round: number): Card[] => {
    const cards: Card[] = [];
    const baseOffset = (seat * 3 + round * 2) % 4;
    for (let i = 0; i < 13; i++) {
      const suit = suits[(baseOffset + Math.floor(i / 4)) % 4];
      const value = ((i * 2 + seat + round) % 13) + 2;
      cards.push({ id: `${suit}-${value}`, suit, value: value as any });
    }
    return cards;
  };

  const initialHandsPerRound: Record<number, Record<number, Card[]>> = {
    1: { 0: createSeededHand(0, 1), 1: createSeededHand(1, 1), 2: createSeededHand(2, 1), 3: createSeededHand(3, 1) },
    2: { 0: createSeededHand(0, 2), 1: createSeededHand(1, 2), 2: createSeededHand(2, 2), 3: createSeededHand(3, 2) },
    3: { 0: createSeededHand(0, 3), 1: createSeededHand(1, 3), 2: createSeededHand(2, 3), 3: createSeededHand(3, 3) },
    4: { 0: createSeededHand(0, 4), 1: createSeededHand(1, 4), 2: createSeededHand(2, 4), 3: createSeededHand(3, 4) },
  };

  const actions: ReplayActionLog[] = [];
  let step = 0;

  actions.push({
    stepIndex: step++,
    roundNumber: 1,
    activeSeat: 0,
    actionType: 'MATCH_START',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 1, activeSeat: 0, hands: initialHandsPerRound[1] }),
    timestamp: Date.now() - 360000,
    metadata: { description: 'Match Started - 4-Player Championship' },
  });

  // Round 1
  actions.push({
    stepIndex: step++,
    roundNumber: 1,
    activeSeat: 0,
    actionType: 'DEAL_ROUND',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 1, activeSeat: 0, hands: initialHandsPerRound[1] }),
    timestamp: Date.now() - 350000,
    metadata: { description: 'Round 1 Dealt: Hearts (+5pts per Heart)' },
  });

  for (let trick = 0; trick < 3; trick++) {
    for (let seat = 0; seat < 4; seat++) {
      const activeSeat = (seat + trick) % 4;
      const c = initialHandsPerRound[1][activeSeat][trick] || { id: `HEARTS-${4 + trick}`, suit: 'HEARTS', value: 4 + trick };
      actions.push({
        stepIndex: step++,
        roundNumber: 1,
        activeSeat,
        actionType: 'CARD_PLAYED',
        cardPlayed: c,
        stateHash: computeStateHash({ roundNumber: 1, activeSeat, hands: initialHandsPerRound[1], currentTrickCards: [c] }),
        timestamp: Date.now() - 340000 + step * 2000,
        metadata: { playerName: players[activeSeat].name, description: `${players[activeSeat].name} played ${c.value} of ${c.suit}` },
      });
    }
    actions.push({
      stepIndex: step++,
      roundNumber: 1,
      activeSeat: trick % 4,
      actionType: 'TRICK_RESOLVED',
      cardPlayed: null,
      stateHash: computeStateHash({ roundNumber: 1, activeSeat: trick % 4, hands: initialHandsPerRound[1] }),
      timestamp: Date.now() - 330000 + step * 2000,
      metadata: { winnerSeat: trick % 4, pointsAwarded: 2, playerName: players[trick % 4].name, description: `Trick won by ${players[trick % 4].name} (+2 pts)` },
    });
  }

  // Round 2
  actions.push({
    stepIndex: step++,
    roundNumber: 2,
    activeSeat: 0,
    actionType: 'DEAL_ROUND',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 2, activeSeat: 0, hands: initialHandsPerRound[2] }),
    timestamp: Date.now() - 250000,
    metadata: { description: 'Round 2 Dealt: Royal Suite (+15pts J/Q/K Hearts)' },
  });

  for (let seat = 0; seat < 4; seat++) {
    const c = initialHandsPerRound[2][seat][0] || { id: `DIAMONDS-10`, suit: 'DIAMONDS', value: 10 };
    actions.push({
      stepIndex: step++,
      roundNumber: 2,
      activeSeat: seat,
      actionType: 'CARD_PLAYED',
      cardPlayed: c,
      stateHash: computeStateHash({ roundNumber: 2, activeSeat: seat, hands: initialHandsPerRound[2], currentTrickCards: [c] }),
      timestamp: Date.now() - 240000 + step * 2000,
      metadata: { playerName: players[seat].name, description: `${players[seat].name} played ${c.value} of ${c.suit}` },
    });
  }

  // Round 3
  actions.push({
    stepIndex: step++,
    roundNumber: 3,
    activeSeat: 0,
    actionType: 'DEAL_ROUND',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 3, activeSeat: 0, hands: initialHandsPerRound[3] }),
    timestamp: Date.now() - 150000,
    metadata: { description: 'Round 3 Dealt: Queen Sudden Death (-50pts Queen of Hearts)' },
  });

  const qhCard: Card = { id: 'HEARTS-12', suit: 'HEARTS', value: 12 };
  actions.push({
    stepIndex: step++,
    roundNumber: 3,
    activeSeat: 1,
    actionType: 'CARD_PLAYED',
    cardPlayed: qhCard,
    stateHash: computeStateHash({ roundNumber: 3, activeSeat: 1, hands: initialHandsPerRound[3], currentTrickCards: [qhCard] }),
    timestamp: Date.now() - 140000,
    metadata: { playerName: players[1].name, description: `💀 ${players[1].name} played Queen of Hearts!` },
  });

  actions.push({
    stepIndex: step++,
    roundNumber: 3,
    activeSeat: 1,
    actionType: 'TRICK_RESOLVED',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 3, activeSeat: 1, hands: initialHandsPerRound[3] }),
    timestamp: Date.now() - 135000,
    metadata: { winnerSeat: 1, pointsAwarded: 50, playerName: players[1].name, description: `💀 Queen taken by ${players[1].name}! (+50 pts penalty)` },
  });

  // Round 4
  actions.push({
    stepIndex: step++,
    roundNumber: 4,
    activeSeat: 0,
    actionType: 'DEAL_ROUND',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 4, activeSeat: 0, hands: initialHandsPerRound[4] }),
    timestamp: Date.now() - 50000,
    metadata: { description: 'Round 4 Dealt: Solitaire Dominoes Race' },
  });

  const s7: Card = { id: 'HEARTS-7', suit: 'HEARTS', value: 7 };
  actions.push({
    stepIndex: step++,
    roundNumber: 4,
    activeSeat: 0,
    actionType: 'CARD_PLAYED',
    cardPlayed: s7,
    stateHash: computeStateHash({ roundNumber: 4, activeSeat: 0, hands: initialHandsPerRound[4] }),
    timestamp: Date.now() - 40000,
    metadata: { playerName: players[0].name, description: `🏎️ ${players[0].name} placed 7 of Hearts` },
  });

  actions.push({
    stepIndex: step++,
    roundNumber: 4,
    activeSeat: 1,
    actionType: 'SOLITAIRE_PASS',
    cardPlayed: null,
    stateHash: computeStateHash({ roundNumber: 4, activeSeat: 1, hands: initialHandsPerRound[4] }),
    timestamp: Date.now() - 35000,
    metadata: { playerName: players[1].name, description: `${players[1].name} forced to PASS` },
  });

  const finalScores = { p0: 0, p1: 65, p2: 12, p3: 25 };

  const record: MatchRecord = {
    id: 'demo_championship_match',
    createdAt: Date.now() - 360000,
    mode: 'SINGLE_PLAYER',
    players,
    initialHandsPerRound,
    actions,
    finalScores,
    winnerPlayerId: 'p0',
    winnerName: 'You (Champion)',
    winnerAvatar: '👑',
    totalRounds: 4,
    totalSteps: actions.length,
  };

  saveMatchToStorage(record);
  return record;
}
