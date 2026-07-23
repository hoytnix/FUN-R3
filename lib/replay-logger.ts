import { Card, RoundNumber, SolitaireBoard, Player } from './types';
import { ReplayActionLog, MatchRecord } from './types/replay';
import { computeStateHash } from './replay/replay-hash';
import { saveMatchToStorage } from './replay/replay-storage';

export { computeStateHash } from './replay/replay-hash';
export {
  getMatchHistory,
  saveMatchToStorage,
  deleteMatchRecord,
  clearAllMatchHistory,
  generateDemoMatchRecord,
} from './replay/replay-storage';

export class ReplayLogger {
  private matchId: string;
  private mode: 'OFFLINE' | 'SINGLE_PLAYER' | 'ONLINE';
  private players: Player[];
  private initialHandsPerRound: Record<number, Record<number, Card[]>> = {};
  private actions: ReplayActionLog[] = [];
  private stepCounter = 0;

  constructor(
    mode: 'OFFLINE' | 'SINGLE_PLAYER' | 'ONLINE',
    players: Player[]
  ) {
    this.matchId = 'match_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    this.mode = mode;
    this.players = players;
    this.initialHandsPerRound = { 1: {}, 2: {}, 3: {}, 4: {} };

    // Record initial match start action
    this.recordAction({
      roundNumber: 1,
      activeSeat: 0,
      actionType: 'MATCH_START',
      cardPlayed: null,
      stateHash: computeStateHash({ roundNumber: 1, activeSeat: 0, hands: {} }),
      metadata: { description: 'Match Created & Log Initialized' },
    });
  }

  public recordRoundDeal(roundNumber: RoundNumber, handsPerSeat: Record<number, Card[]>, startingSeat: number) {
    const clonedHands: Record<number, Card[]> = {};
    Object.keys(handsPerSeat).forEach((seat) => {
      clonedHands[Number(seat)] = handsPerSeat[Number(seat)].map((c) => ({ ...c }));
    });
    this.initialHandsPerRound[roundNumber] = clonedHands;

    const hash = computeStateHash({
      roundNumber,
      activeSeat: startingSeat,
      hands: clonedHands,
    });

    this.recordAction({
      roundNumber,
      activeSeat: startingSeat,
      actionType: 'DEAL_ROUND',
      cardPlayed: null,
      stateHash: hash,
      metadata: { description: `Round ${roundNumber} Dealt - Seat ${startingSeat} leads` },
    });
  }

  public recordCardPlay(
    roundNumber: RoundNumber,
    activeSeat: number,
    card: Card,
    currentHands: Record<number, Card[]>,
    currentTrickCards?: Card[],
    solitaireBoard?: SolitaireBoard,
    scores?: Record<string, number[]>,
    totalScores?: Record<string, number>,
    playerName?: string
  ) {
    const hash = computeStateHash({
      roundNumber,
      activeSeat,
      hands: currentHands,
      currentTrickCards,
      solitaireBoard,
      scores,
      totalScores,
    });

    this.recordAction({
      roundNumber,
      activeSeat,
      actionType: 'CARD_PLAYED',
      cardPlayed: card,
      stateHash: hash,
      metadata: {
        playerName,
        description: `${playerName || `Player ${activeSeat + 1}`} played ${card.value} of ${card.suit}`,
      },
    });
  }

  public recordSolitairePass(
    roundNumber: RoundNumber,
    activeSeat: number,
    currentHands: Record<number, Card[]>,
    solitaireBoard: SolitaireBoard,
    scores?: Record<string, number[]>,
    totalScores?: Record<string, number>,
    playerName?: string
  ) {
    const hash = computeStateHash({
      roundNumber,
      activeSeat,
      hands: currentHands,
      solitaireBoard,
      scores,
      totalScores,
    });

    this.recordAction({
      roundNumber,
      activeSeat,
      actionType: 'SOLITAIRE_PASS',
      cardPlayed: null,
      stateHash: hash,
      metadata: {
        playerName,
        description: `${playerName || `Player ${activeSeat + 1}`} passed in Solitaire`,
      },
    });
  }

  public recordTrickResolved(
    roundNumber: RoundNumber,
    winnerSeat: number,
    winnerPlayerId: string,
    pointsAwarded: number,
    currentHands: Record<number, Card[]>,
    scores?: Record<string, number[]>,
    totalScores?: Record<string, number>,
    playerName?: string
  ) {
    const hash = computeStateHash({
      roundNumber,
      activeSeat: winnerSeat,
      hands: currentHands,
      scores,
      totalScores,
    });

    this.recordAction({
      roundNumber,
      activeSeat: winnerSeat,
      actionType: 'TRICK_RESOLVED',
      cardPlayed: null,
      stateHash: hash,
      metadata: {
        winnerSeat,
        winnerPlayerId,
        pointsAwarded,
        playerName,
        description: `Trick won by ${playerName || `Seat ${winnerSeat + 1}`} (+${pointsAwarded} pts)`,
      },
    });
  }

  public recordRoundEnd(roundNumber: RoundNumber, activeSeat: number, totalScores: Record<string, number>) {
    const hash = computeStateHash({
      roundNumber,
      activeSeat,
      hands: { 0: [], 1: [], 2: [], 3: [] },
      totalScores,
    });

    this.recordAction({
      roundNumber,
      activeSeat,
      actionType: 'ROUND_END',
      cardPlayed: null,
      stateHash: hash,
      metadata: { description: `Round ${roundNumber} Complete` },
    });
  }

  private recordAction(data: Omit<ReplayActionLog, 'stepIndex' | 'timestamp'>) {
    const log: ReplayActionLog = {
      ...data,
      stepIndex: this.stepCounter++,
      timestamp: Date.now(),
    };
    this.actions.push(log);
  }

  public finalizeMatch(
    finalScores: Record<string, number>,
    winnerPlayer: Player
  ): MatchRecord {
    this.recordAction({
      roundNumber: 4,
      activeSeat: winnerPlayer.seatIndex,
      actionType: 'MATCH_END',
      cardPlayed: null,
      stateHash: computeStateHash({ roundNumber: 4, activeSeat: winnerPlayer.seatIndex, hands: {}, totalScores: finalScores }),
      metadata: {
        winnerPlayerId: winnerPlayer.id,
        playerName: winnerPlayer.name,
        description: `Match Finished! Winner: ${winnerPlayer.name} (${finalScores[winnerPlayer.id] ?? 0} pts)`,
      },
    });

    const record: MatchRecord = {
      id: this.matchId,
      createdAt: Date.now(),
      mode: this.mode,
      players: this.players,
      initialHandsPerRound: this.initialHandsPerRound,
      actions: this.actions,
      finalScores,
      winnerPlayerId: winnerPlayer.id,
      winnerName: winnerPlayer.name,
      winnerAvatar: winnerPlayer.avatar,
      totalRounds: 4,
      totalSteps: this.actions.length,
    };

    saveMatchToStorage(record);
    return record;
  }
}
