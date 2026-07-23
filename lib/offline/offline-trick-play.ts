import { Card, TrickCard, Player } from '../types';
import { formatCardName } from '../game-engine';
import { evaluateOfflineTrickResult } from '../rules/trick-evaluator';
import { saveOfflineState } from './offline-storage';
import { OfflineGameState } from '../offline-engine';

export function handleOfflineTrickPlay(
  state: OfflineGameState,
  activePlayer: Player,
  playerId: string,
  card: Card,
  updatedHands: Record<string, Card[]>
): OfflineGameState {
  const newTrickCard: TrickCard = {
    playerId,
    seatIndex: activePlayer.seatIndex,
    card,
  };

  const newTrick = [...state.currentTrick, newTrickCard];
  const newLeadSuit = state.leadSuit || card.suit;

  if (newTrick.length === 4) {
    const {
      winnerTrickCard,
      winnerPlayer,
      winnerSeat,
      points,
      isSuddenDeath,
      lastTrickInfo,
    } = evaluateOfflineTrickResult(
      newTrick,
      newLeadSuit,
      state.currentRound,
      state.players
    );

    const newScores = { ...state.scores };
    const roundIdx = state.currentRound - 1;
    newScores[winnerTrickCard.playerId] = [
      ...(newScores[winnerTrickCard.playerId] || [0, 0, 0, 0]),
    ];
    newScores[winnerTrickCard.playerId][roundIdx] += points;

    const newTotalScores = { ...state.totalScores };
    Object.keys(newScores).forEach((pid) => {
      newTotalScores[pid] = newScores[pid].reduce((a, b) => a + b, 0);
    });

    const updated: OfflineGameState = {
      ...state,
      status: 'TRICK_EVALUATION',
      activeSeatIndex: winnerSeat,
      hands: updatedHands,
      leadSuit: newLeadSuit,
      currentTrick: newTrick,
      trickLeaderSeat: winnerSeat,
      lastCompletedTrick: lastTrickInfo,
      scores: newScores,
      totalScores: newTotalScores,
      lastActionMessage: isSuddenDeath
        ? `💀 Queen of Hearts taken by ${winnerPlayer?.name}! Round 3 Ended (+50 pts).`
        : `Trick won by ${winnerPlayer?.name} (+${points} pts)!`,
      manualShieldActive: false,
    };

    saveOfflineState(updated);
    return updated;
  }

  const nextSeat = (state.activeSeatIndex + 1) % 4;
  const updated: OfflineGameState = {
    ...state,
    status: 'PASS_SHIELD',
    activeSeatIndex: nextSeat,
    hands: updatedHands,
    leadSuit: newLeadSuit,
    currentTrick: newTrick,
    lastActionMessage: `${activePlayer.name} played ${formatCardName(card)}. Pass phone to next player.`,
    manualShieldActive: false,
  };

  saveOfflineState(updated);
  return updated;
}
