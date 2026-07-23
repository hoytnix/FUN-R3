import { Card, Player } from '../types';
import { OfflineGameState, saveOfflineState } from '../offline-engine';
import { formatCardName } from '../game-engine';

export function getNextSolitaireSeat(
  currentSeat: number,
  hands: Record<string, Card[]>,
  players: Player[]
): number {
  let next = (currentSeat + 1) % 4;
  let loops = 0;
  while (loops < 4) {
    const p = players.find((pl) => pl.seatIndex === next);
    const pHand = p ? hands[p.id] || [] : [];
    if (pHand.length > 0) {
      return next;
    }
    next = (next + 1) % 4;
    loops++;
  }
  return currentSeat;
}

// Pass in Solitaire when no moves available
export function passOfflineSolitaire(
  state: OfflineGameState,
  playerId: string
): OfflineGameState {
  const activePlayer = state.players.find((p) => p.seatIndex === state.activeSeatIndex);
  if (!activePlayer || activePlayer.id !== playerId) return state;

  const passedSeats = Array.from(
    new Set([...state.solitairePassedSeats, activePlayer.seatIndex])
  );
  const newPassCount = state.consecutiveSolitairePasses + 1;

  const nextSeat = getNextSolitaireSeat(state.activeSeatIndex, state.hands, state.players);

  const activeRemainingPlayers = state.players.filter(
    (p) => (state.hands[p.id] || []).length > 0
  );

  // If everyone remaining has passed in sequence without moves
  if (newPassCount >= activeRemainingPlayers.length) {
    // End Round 4 and assign placement points to remaining
    const solitairePlacements = [...state.solitairePlacements];
    const newScores = { ...state.scores };
    const newTotalScores = { ...state.totalScores };

    // Sort remaining players by fewest cards left
    const sortedRemaining = [...activeRemainingPlayers].sort(
      (a, b) => (state.hands[a.id] || []).length - (state.hands[b.id] || []).length
    );

    sortedRemaining.forEach((p) => {
      const placementRank = (solitairePlacements.length + 1) as 1 | 2 | 3 | 4;
      const pointsMap: Record<number, number> = { 1: 0, 2: 10, 3: 25, 4: 50 };
      const pts = pointsMap[placementRank] ?? 50;

      solitairePlacements.push({
        playerId: p.id,
        seatIndex: p.seatIndex,
        placement: placementRank,
        timestamp: Date.now(),
        pointsAwarded: pts,
      });

      newScores[p.id] = [...(newScores[p.id] || [0, 0, 0, 0])];
      newScores[p.id][3] = pts;

      newTotalScores[p.id] =
        (newScores[p.id][0] || 0) +
        (newScores[p.id][1] || 0) +
        (newScores[p.id][2] || 0) +
        pts;
    });

    const updated: OfflineGameState = {
      ...state,
      status: 'ROUND_END',
      scores: newScores,
      totalScores: newTotalScores,
      solitairePlacements,
      solitairePassedSeats: passedSeats,
      lastActionMessage: 'No further legal moves in Solitaire! Round 4 Ended.',
      manualShieldActive: false,
    };

    saveOfflineState(updated);
    return updated;
  }

  const updated: OfflineGameState = {
    ...state,
    status: 'PASS_SHIELD',
    activeSeatIndex: nextSeat,
    solitairePassedSeats: passedSeats,
    consecutiveSolitairePasses: newPassCount,
    lastActionMessage: `${activePlayer.name} passed. Pass phone to next player.`,
    manualShieldActive: false,
  };

  saveOfflineState(updated);
  return updated;
}
