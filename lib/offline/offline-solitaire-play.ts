import { Card, Player } from '../types';
import { updateSolitaireBoard, formatCardName } from '../game-engine';
import { saveOfflineState } from './offline-storage';
import { getNextSolitaireSeat } from './offline-solitaire';
import { OfflineGameState } from '../offline-engine';

export function handleOfflineSolitairePlay(
  state: OfflineGameState,
  activePlayer: Player,
  playerId: string,
  card: Card,
  updatedHands: Record<string, Card[]>
): OfflineGameState {
  const newSolitaireBoard = updateSolitaireBoard(state.solitaireBoard, card);
  const solitairePlacements = [...state.solitairePlacements];
  const newHand = updatedHands[playerId] || [];

  if (newHand.length === 0) {
    const placementRank = (solitairePlacements.length + 1) as 1 | 2 | 3 | 4;
    const pointsMap: Record<number, number> = { 1: 0, 2: 10, 3: 25, 4: 50 };
    const pts = pointsMap[placementRank] ?? 50;

    solitairePlacements.push({
      playerId,
      seatIndex: activePlayer.seatIndex,
      placement: placementRank,
      timestamp: Date.now(),
      pointsAwarded: pts,
    });

    const newScores = { ...state.scores };
    newScores[playerId] = [...(newScores[playerId] || [0, 0, 0, 0])];
    newScores[playerId][3] = pts;

    const newTotalScores = { ...state.totalScores };
    newTotalScores[playerId] =
      (newScores[playerId][0] || 0) +
      (newScores[playerId][1] || 0) +
      (newScores[playerId][2] || 0) +
      pts;

    state = { ...state, scores: newScores, totalScores: newTotalScores };
  }

  const remainingPlayersWithCards = state.players.filter(
    (p) => (updatedHands[p.id] || []).length > 0
  );

  if (remainingPlayersWithCards.length <= 1) {
    if (remainingPlayersWithCards.length === 1) {
      const lastP = remainingPlayersWithCards[0];
      if (!solitairePlacements.some((sp) => sp.playerId === lastP.id)) {
        solitairePlacements.push({
          playerId: lastP.id,
          seatIndex: lastP.seatIndex,
          placement: 4,
          timestamp: Date.now(),
          pointsAwarded: 50,
        });
        const newScores = { ...state.scores };
        newScores[lastP.id] = [...(newScores[lastP.id] || [0, 0, 0, 0])];
        newScores[lastP.id][3] = 50;

        const newTotalScores = { ...state.totalScores };
        newTotalScores[lastP.id] =
          (newScores[lastP.id][0] || 0) +
          (newScores[lastP.id][1] || 0) +
          (newScores[lastP.id][2] || 0) +
          50;

        state = { ...state, scores: newScores, totalScores: newTotalScores };
      }
    }

    const updated: OfflineGameState = {
      ...state,
      status: 'ROUND_END',
      hands: updatedHands,
      solitaireBoard: newSolitaireBoard,
      solitairePlacements,
      lastActionMessage: 'Round 4 Solitaire Race Complete!',
      manualShieldActive: false,
    };

    saveOfflineState(updated);
    return updated;
  }

  const nextSeat = getNextSolitaireSeat(state.activeSeatIndex, updatedHands, state.players);

  const updated: OfflineGameState = {
    ...state,
    status: 'PASS_SHIELD',
    activeSeatIndex: nextSeat,
    hands: updatedHands,
    solitaireBoard: newSolitaireBoard,
    solitairePlacements,
    consecutiveSolitairePasses: 0,
    lastActionMessage: `${activePlayer.name} placed ${formatCardName(card)}. Pass phone to next player.`,
    manualShieldActive: false,
  };

  saveOfflineState(updated);
  return updated;
}
