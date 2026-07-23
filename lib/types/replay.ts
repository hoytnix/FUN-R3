import { Card, Suit, RoundNumber, SolitaireBoard, SolitairePlacement, TrickCard, Player } from '../types';

export type ReplayActionType =
  | 'MATCH_START'
  | 'DEAL_ROUND'
  | 'CARD_PLAYED'
  | 'SOLITAIRE_PASS'
  | 'TRICK_RESOLVED'
  | 'ROUND_END'
  | 'MATCH_END';

export interface ReplayActionLog {
  stepIndex: number;
  roundNumber: RoundNumber;
  activeSeat: number; // 0, 1, 2, 3
  actionType: ReplayActionType;
  cardPlayed: Card | null;
  stateHash: string; // FNV-1a or SHA-256 lightweight checksum string
  timestamp: number;
  metadata?: {
    playerName?: string;
    pointsAwarded?: number;
    winnerSeat?: number;
    winnerPlayerId?: string;
    solitairePlacement?: number;
    description?: string;
    leadSuit?: Suit | null;
  };
}

export interface MatchRecord {
  id: string;
  createdAt: number;
  mode: 'OFFLINE' | 'SINGLE_PLAYER' | 'ONLINE';
  players: Player[];
  initialHandsPerRound: Record<number, Record<number, Card[]>>; // seatIndex -> roundNumber -> Card[]
  actions: ReplayActionLog[];
  finalScores: Record<string, number>; // playerId -> total score
  winnerPlayerId: string;
  winnerName: string;
  winnerAvatar: string;
  totalRounds: number;
  totalSteps: number;
}

export interface ReplayStepState {
  stepIndex: number;
  currentRound: RoundNumber;
  activeSeat: number;
  hands: Record<number, Card[]>; // seatIndex -> Card[] (ALL 4 HANDS FACE UP)
  leadSuit: Suit | null;
  currentTrick: TrickCard[];
  solitaireBoard: SolitaireBoard;
  solitairePlacements: SolitairePlacement[];
  scores: Record<string, number[]>; // playerId -> [R1, R2, R3, R4]
  totalScores: Record<string, number>;
  lastActionDescription: string;
  isVerified: boolean;
  expectedHash: string;
  actualHash: string;
  driftCorrected: boolean;
  lastPlayedCardInfo?: {
    seatIndex: number;
    card: Card;
  } | null;
}
