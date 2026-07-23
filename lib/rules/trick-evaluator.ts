import { TrickCard, RoundNumber, Player } from '@/lib/types';
import {
  evaluateTrickWinner,
  calculateTrickPoints,
} from '@/lib/game-engine';

export interface TrickEvaluationResult {
  winnerTrickCard: TrickCard;
  winnerPlayer: Player | undefined;
  winnerSeat: number;
  points: number;
  isSuddenDeath: boolean;
  lastTrickInfo: {
    cards: TrickCard[];
    winnerPlayerId: string;
    winnerSeatIndex: number;
    pointsAwarded: number;
    roundNumber: RoundNumber;
  };
}

export function evaluateOfflineTrickResult(
  trick: TrickCard[],
  leadSuit: any,
  roundNumber: RoundNumber,
  players: Player[]
): TrickEvaluationResult {
  const winnerTrickCard = evaluateTrickWinner(trick, leadSuit);
  const winnerPlayer = players.find((p) => p.id === winnerTrickCard.playerId);
  const winnerSeat = winnerPlayer ? winnerPlayer.seatIndex : 0;

  const { points, isSuddenDeath } = calculateTrickPoints(trick, roundNumber);

  const lastTrickInfo = {
    cards: trick,
    winnerPlayerId: winnerTrickCard.playerId,
    winnerSeatIndex: winnerSeat,
    pointsAwarded: points,
    roundNumber,
  };

  return {
    winnerTrickCard,
    winnerPlayer,
    winnerSeat,
    points,
    isSuddenDeath,
    lastTrickInfo,
  };
}
