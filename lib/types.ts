export type Suit = 'HEARTS' | 'DIAMONDS' | 'CLUBS' | 'SPADES';

export type CardValue = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  id: string; // e.g., "HEARTS-12" or "Q-HEARTS"
  suit: Suit;
  value: CardValue; // 11=J, 12=Q, 13=K, 14=A
}

export type GameStatus = 
  | 'LOBBY_WAITING' 
  | 'DEAL_HANDS' 
  | 'PLAYER_TURN' 
  | 'TRICK_EVALUATION' 
  | 'ROUND_END' 
  | 'GAME_OVER';

export type RoundNumber = 1 | 2 | 3 | 4;

export interface Player {
  id: string;
  name: string;
  avatar: string;
  seatIndex: number; // 0, 1, 2, 3
  isHost: boolean;
  isBot: boolean;
  connected: boolean;
  lastSeen: number;
}

export interface TrickCard {
  playerId: string;
  seatIndex: number;
  card: Card;
}

export interface SolitaireBoard {
  // Array of placed values per suit, e.g. HEARTS: [7, 8, 9, 6]
  placed: Record<Suit, number[]>;
  minAvailable: Record<Suit, number | null>; // e.g., 6 (can play 5)
  maxAvailable: Record<Suit, number | null>; // e.g., 8 (can play 9)
}

export interface SolitairePlacement {
  playerId: string;
  seatIndex: number;
  placement: 1 | 2 | 3 | 4;
  timestamp: number;
  pointsAwarded: number; // 1st=0, 2nd=10, 3rd=25, 4th=50
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface FloatingReaction {
  id: string;
  playerId: string;
  emoji: string;
  timestamp: number;
}

export type BotDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'CASUAL' | 'CUTTHROAT' | 'CHAOS';
export type BotPersonality = 'CASUAL' | 'CUTTHROAT' | 'CHAOS';

export interface RoomState {
  roomCode: string;
  createdAt: number;
  status: GameStatus;
  currentRound: RoundNumber;
  hostId: string;
  players: Player[];
  turnSeatIndex: number;
  turnDeadline: number; // timestamp in ms
  turnTimerSeconds?: number;
  difficulty?: BotDifficulty;
  leadSuit: Suit | null;
  currentTrick: TrickCard[];
  trickLeaderSeat: number;
  playedCardsHistory?: Card[]; // Shared card-counting memory array for current round
  lastCompletedTrick: {
    cards: TrickCard[];
    winnerPlayerId: string;
    winnerSeatIndex: number;
    pointsAwarded: number;
    roundNumber: RoundNumber;
  } | null;
  scores: Record<string, number[]>; // playerId -> [R1_score, R2_score, R3_score, R4_score]
  totalScores: Record<string, number>; // playerId -> total
  hands: Record<string, Card[]>; // playerId -> list of cards remaining
  tricksTakenCount?: Record<string, number>; // playerId -> count of tricks won
  solitaireBoard: SolitaireBoard;
  solitairePlacements: SolitairePlacement[];
  solitairePassedSeats: number[]; // seats that were forced to pass because no legal moves
  chatMessages: ChatMessage[];
  reactions: FloatingReaction[];
  lastActionMessage?: string;
}
