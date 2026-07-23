import {
  RoomState,
  Player,
  Card,
  RoundNumber,
  TrickCard,
} from '@/lib/types';
import {
  createDeck,
  dealHands,
  evaluateTrickWinner,
  calculateTrickPoints,
  createInitialSolitaireBoard,
  formatCardName,
} from '@/lib/game-engine';
import {
  BOT_NAMES,
  BOT_AVATARS,
  BotDifficulty,
  getTurnTimerSeconds,
} from '@/lib/bot-engine';

export function createInitialSinglePlayerRoom(
  humanId: string,
  playerName: string,
  playerAvatar: string,
  difficulty: BotDifficulty,
  roundNum: RoundNumber = 1,
  currentTotals: Record<string, number> = {},
  prevScores: Record<string, number[]> = {}
): RoomState {
  const timerSeconds = getTurnTimerSeconds(difficulty);
  const timerMs = timerSeconds * 1000;
  const deck = createDeck();
  const rawHands = dealHands(deck);

  const now = Date.now();
  const players: Player[] = [
    {
      id: humanId,
      name: playerName || 'Player 1',
      avatar: playerAvatar || '🖕',
      seatIndex: 0,
      isHost: true,
      isBot: false,
      connected: true,
      lastSeen: now,
    },
    {
      id: 'bot_seat_1',
      name: BOT_NAMES[0],
      avatar: BOT_AVATARS[0],
      seatIndex: 1,
      isHost: false,
      isBot: true,
      connected: true,
      lastSeen: now,
    },
    {
      id: 'bot_seat_2',
      name: BOT_NAMES[1],
      avatar: BOT_AVATARS[1],
      seatIndex: 2,
      isHost: false,
      isBot: true,
      connected: true,
      lastSeen: now,
    },
    {
      id: 'bot_seat_3',
      name: BOT_NAMES[2],
      avatar: BOT_AVATARS[2],
      seatIndex: 3,
      isHost: false,
      isBot: true,
      connected: true,
      lastSeen: now,
    },
  ];

  const hands: Record<string, Card[]> = {
    [humanId]: rawHands['0'],
    bot_seat_1: rawHands['1'],
    bot_seat_2: rawHands['2'],
    bot_seat_3: rawHands['3'],
  };

  const initialScores: Record<string, number[]> = {
    [humanId]: prevScores[humanId] ? [...prevScores[humanId]] : [0, 0, 0, 0],
    bot_seat_1: prevScores.bot_seat_1 ? [...prevScores.bot_seat_1] : [0, 0, 0, 0],
    bot_seat_2: prevScores.bot_seat_2 ? [...prevScores.bot_seat_2] : [0, 0, 0, 0],
    bot_seat_3: prevScores.bot_seat_3 ? [...prevScores.bot_seat_3] : [0, 0, 0, 0],
  };

  const initialTotals: Record<string, number> = {
    [humanId]: currentTotals[humanId] ?? 0,
    bot_seat_1: currentTotals.bot_seat_1 ?? 0,
    bot_seat_2: currentTotals.bot_seat_2 ?? 0,
    bot_seat_3: currentTotals.bot_seat_3 ?? 0,
  };

  let startingSeat = 0;
  if (roundNum === 4) {
    for (const p of players) {
      const pHand = hands[p.id] || [];
      if (pHand.some((c) => c.suit === 'HEARTS' && c.value === 7)) {
        startingSeat = p.seatIndex;
        break;
      }
    }
  }

  return {
    roomCode: 'SP-MATCH',
    createdAt: now,
    hostId: humanId,
    status: 'PLAYER_TURN',
    currentRound: roundNum,
    turnSeatIndex: startingSeat,
    trickLeaderSeat: startingSeat,
    leadSuit: null,
    currentTrick: [],
    hands,
    scores: initialScores,
    totalScores: initialTotals,
    solitaireBoard: createInitialSolitaireBoard(),
    solitairePlacements: [],
    solitairePassedSeats: [],
    players,
    turnDeadline: Date.now() + timerMs,
    turnTimerSeconds: timerSeconds,
    difficulty,
    lastActionMessage: `Round ${roundNum} started! Difficulty: ${difficulty} (${timerSeconds}s timer)`,
    lastCompletedTrick: null,
    chatMessages: [],
    reactions: [],
  };
}
