'use client';

import { Card, TrickCard, Player, RoundNumber } from './types';
import { speakTaunt, cancelSpeech } from './audio-taunts';

export interface CommentatorStateSnapshot {
  status: string;
  currentRound: RoundNumber;
  players: Player[];
  lastCompletedTrick: {
    cards: TrickCard[];
    winnerPlayerId: string;
    winnerSeatIndex: number;
    pointsAwarded: number;
    roundNumber: RoundNumber;
  } | null;
  totalScores: Record<string, number>;
  solitairePlacements: Array<{
    playerId: string;
    seatIndex: number;
    placement: 1 | 2 | 3 | 4;
    pointsAwarded: number;
  }>;
}

class CommentatorEngine {
  private lastHandledTrickKey: string | null = null;
  private lastHandledPlacementCount: number = 0;
  private lastLeaderPlayerId: string | null = null;
  private lastGameStatus: string | null = null;

  public resetObserver() {
    this.lastHandledTrickKey = null;
    this.lastHandledPlacementCount = 0;
    this.lastLeaderPlayerId = null;
    this.lastGameStatus = null;
  }

  private getPlayerName(players: Player[], playerId: string, seatIndex: number): string {
    const found = players.find((p) => p.id === playerId || p.seatIndex === seatIndex);
    return found ? found.name : `Player ${seatIndex + 1}`;
  }

  private getLeaderPlayerId(players: Player[], totalScores: Record<string, number>): { id: string; score: number } | null {
    if (!players || players.length === 0) return null;
    let minScore = Infinity;
    let leaderId: string | null = null;

    players.forEach((p) => {
      const score = totalScores[p.id] ?? 0;
      if (score < minScore) {
        minScore = score;
        leaderId = p.id;
      }
    });

    return leaderId ? { id: leaderId, score: minScore } : null;
  }

  public observeGameState(
    prev: CommentatorStateSnapshot | null,
    curr: CommentatorStateSnapshot
  ) {
    if (!curr) return;

    // 1. Evaluate Last Completed Trick Transitions
    if (curr.lastCompletedTrick) {
      const trickKey = `${curr.currentRound}-${curr.lastCompletedTrick.winnerPlayerId}-${curr.lastCompletedTrick.cards.map((c) => c.card.id).join('-')}`;
      
      if (trickKey !== this.lastHandledTrickKey) {
        this.lastHandledTrickKey = trickKey;
        this.evaluateTrickCommentary(curr);
      }
    }

    // 2. Evaluate Round 4 Solitaire Placements
    if (curr.currentRound === 4 && curr.solitairePlacements) {
      if (curr.solitairePlacements.length > this.lastHandledPlacementCount) {
        const newPlacement = curr.solitairePlacements[curr.solitairePlacements.length - 1];
        this.lastHandledPlacementCount = curr.solitairePlacements.length;
        this.evaluateSolitairePlacementCommentary(curr, newPlacement);
      }
    }

    // 3. Evaluate Score Leaderboard Shift
    if (curr.players && curr.totalScores) {
      const leader = this.getLeaderPlayerId(curr.players, curr.totalScores);
      if (leader && leader.id !== this.lastLeaderPlayerId) {
        if (this.lastLeaderPlayerId !== null && curr.status !== 'GAME_OVER') {
          const leaderName = this.getPlayerName(curr.players, leader.id, -1);
          speakTaunt(`New leader! ${leaderName} takes first place with ${leader.score} penalty points!`, 'commentator');
        }
        this.lastLeaderPlayerId = leader.id;
      }
    }

    // 4. Evaluate Game Over
    if (curr.status === 'GAME_OVER' && this.lastGameStatus !== 'GAME_OVER') {
      this.lastGameStatus = 'GAME_OVER';
      const leader = this.getLeaderPlayerId(curr.players, curr.totalScores);
      if (leader) {
        const winnerName = this.getPlayerName(curr.players, leader.id, -1);
        speakTaunt(`Game over! ${winnerName} reigns supreme with a winning total of ${leader.score} points!`, 'commentator', true);
      }
    } else {
      this.lastGameStatus = curr.status;
    }
  }

  private evaluateTrickCommentary(curr: CommentatorStateSnapshot) {
    const trick = curr.lastCompletedTrick;
    if (!trick) return;

    const winnerName = this.getPlayerName(curr.players, trick.winnerPlayerId, trick.winnerSeatIndex);
    const roundNum = trick.roundNumber || curr.currentRound;

    // --- Round 1: Hearts ---
    if (roundNum === 1) {
      const heartsCards = trick.cards.filter((tc) => tc.card.suit === 'HEARTS');
      const hasAceOfHearts = heartsCards.some((tc) => tc.card.value === 14);

      if (hasAceOfHearts) {
        speakTaunt(`${winnerName} absorbed the Ace of Hearts! Ouch, major penalty points!`, 'commentator');
      } else if (heartsCards.length >= 3) {
        speakTaunt(`${winnerName} swallowed ${heartsCards.length} Hearts! That is a heavy penalty payload!`, 'commentator');
      }
    }

    // --- Round 2: Royal Suite ---
    else if (roundNum === 2) {
      const royalHearts = trick.cards.filter(
        (tc) => tc.card.suit === 'HEARTS' && [11, 12, 13].includes(tc.card.value)
      );

      royalHearts.forEach((tc) => {
        if (tc.card.value === 11) {
          speakTaunt(`${winnerName} caught the Jack of Hearts! 15 penalty points on the board!`, 'commentator');
        } else if (tc.card.value === 12) {
          speakTaunt(`${winnerName} swallowed the Queen of Hearts! 15 penalty points!`, 'commentator');
        } else if (tc.card.value === 13) {
          speakTaunt(`${winnerName} took the King of Hearts! 15 penalty points!`, 'commentator');
        }
      });
    }

    // --- Round 3: Queen of Hearts Sudden Death ---
    else if (roundNum === 3) {
      const queenOfHearts = trick.cards.find(
        (tc) => tc.card.suit === 'HEARTS' && tc.card.value === 12
      );

      if (queenOfHearts) {
        // High priority - cancel previous speech and shout sudden death
        cancelSpeech();
        speakTaunt(
          `SUDDEN DEATH! ${winnerName} caught the Queen of Hearts! Round 3 is OVER immediately!`,
          'commentator',
          true
        );
      }
    }
  }

  private evaluateSolitairePlacementCommentary(
    curr: CommentatorStateSnapshot,
    placement: { playerId: string; seatIndex: number; placement: 1 | 2 | 3 | 4; pointsAwarded: number }
  ) {
    const playerName = this.getPlayerName(curr.players, placement.playerId, placement.seatIndex);

    if (placement.placement === 1) {
      speakTaunt(`${playerName} finishes 1st in Solitaire! Zero penalty points added!`, 'commentator');
    } else if (placement.placement === 2) {
      speakTaunt(`${playerName} finishes 2nd in Around the World! 10 penalty points.`, 'commentator');
    } else if (placement.placement === 3) {
      speakTaunt(`${playerName} finishes 3rd! 25 penalty points!`, 'commentator');
    } else if (placement.placement === 4) {
      speakTaunt(`${playerName} takes last place in Solitaire! 50 penalty points!`, 'commentator');
    }
  }
}

export const commentatorEngine = new CommentatorEngine();
