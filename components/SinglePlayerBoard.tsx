'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameBoard } from '@/components/GameBoard';
import { GameOverOverlay } from '@/components/game/GameOverOverlay';
import { RulesModal } from '@/components/RulesModal';
import { ScoreboardModal } from '@/components/ScoreboardModal';
import {
  RoomState,
  Player,
  Card,
  RoundNumber,
  TrickCard,
} from '@/lib/types';
import {
  evaluateTrickWinner,
  calculateTrickPoints,
  updateSolitaireBoard,
  getPlayableCards,
  formatCardName,
} from '@/lib/game-engine';
import {
  pickBotCard,
  getBotDelay,
  BotDifficulty,
} from '@/lib/bot-engine';
import { createInitialSinglePlayerRoom } from '@/lib/rules/single-player-engine';
import { SinglePlayerHeaderPanel } from '@/components/game/SinglePlayerHeaderPanel';
import { soundEngine } from '@/lib/audio';

interface SinglePlayerBoardProps {
  playerName: string;
  playerAvatar: string;
  difficulty: BotDifficulty;
  onExitToMenu: () => void;
  onRoomChange?: (room: RoomState) => void;
  onOpenRules?: () => void;
  onOpenScoreboard?: () => void;
  isEmojiModalOpen?: boolean;
  onToggleEmojiModal?: () => void;
}

export const SinglePlayerBoard: React.FC<SinglePlayerBoardProps> = ({
  playerName,
  playerAvatar,
  difficulty,
  onExitToMenu,
  onRoomChange,
  onOpenRules,
  onOpenScoreboard,
  isEmojiModalOpen,
  onToggleEmojiModal,
}) => {
  const humanId = 'human_player';

  // Modal States
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);

  const [room, setRoom] = useState<RoomState>(() =>
    createInitialSinglePlayerRoom(humanId, playerName, playerAvatar, difficulty, 1)
  );
  const [isTrickEvaluating, setIsTrickEvaluating] = useState(false);

  // Notify parent of room state changes for the outer header
  useEffect(() => {
    onRoomChange?.(room);
  }, [room, onRoomChange]);

  // Execute a card play
  const executeCardPlay = useCallback(
    (player: Player, card: Card) => {
      const playerHand = room.hands?.[player.id] || [];
      const updatedHand = playerHand.filter((c) => c.id !== card.id);
      const updatedHands = { ...room.hands, [player.id]: updatedHand };

      soundEngine.playCardSnap();

      const timerMs = (room.turnTimerSeconds || 40) * 1000;

      if (room.currentRound <= 3) {
        // Trick taking play
        const newTrickCard: TrickCard = {
          card,
          playerId: player.id,
          seatIndex: player.seatIndex,
        };
        const updatedTrick = [...room.currentTrick, newTrickCard];
        const newLeadSuit = room.leadSuit || card.suit;

        if (updatedTrick.length < 4) {
          // Next player turn
          const nextSeat = (room.turnSeatIndex + 1) % 4;
          setRoom((prev) => ({
            ...prev,
            hands: updatedHands,
            currentTrick: updatedTrick,
            leadSuit: newLeadSuit,
            turnSeatIndex: nextSeat,
            turnDeadline: Date.now() + timerMs,
            playedCardsHistory: [...(prev.playedCardsHistory || []), card],
            lastActionMessage: `${player.name} played ${formatCardName(card)}`,
          }));
        } else {
          // 4th Card Played -> Evaluate Trick with 3-Second Delay
          const winnerTrickCard = evaluateTrickWinner(updatedTrick, newLeadSuit);
          const winnerPlayer = room.players.find((p) => p.id === winnerTrickCard.playerId);
          const winnerId = winnerPlayer?.id || humanId;
          const winnerSeat = winnerTrickCard.seatIndex;

          const { points, isSuddenDeath } = calculateTrickPoints(updatedTrick, room.currentRound);

          const winnerScores = [...(room.scores?.[winnerId] || [0, 0, 0, 0])];
          winnerScores[room.currentRound - 1] = (winnerScores[room.currentRound - 1] || 0) + points;

          const updatedScores = {
            ...room.scores,
            [winnerId]: winnerScores,
          };

          const updatedTotals = {
            ...room.totalScores,
            [winnerId]: (room.totalScores?.[winnerId] ?? 0) + points,
          };

          const allHandsEmpty = Object.values(updatedHands).every((h) => h.length === 0);
          const endRoundNow = allHandsEmpty || isSuddenDeath;

          if (isSuddenDeath) {
            soundEngine.playSuddenDeath();
          } else {
            soundEngine.playTrickSweep();
          }

          // Set state with 4th card displayed
          setRoom((prev) => ({
            ...prev,
            hands: updatedHands,
            currentTrick: updatedTrick,
            leadSuit: newLeadSuit,
            scores: updatedScores,
            totalScores: updatedTotals,
            lastCompletedTrick: {
              cards: updatedTrick,
              winnerPlayerId: winnerId,
              winnerSeatIndex: winnerSeat,
              pointsAwarded: points,
              roundNumber: room.currentRound,
            },
            lastActionMessage: isSuddenDeath
              ? `💀 Queen of Hearts taken by ${winnerPlayer?.name}! Sudden Death (+50 pts).`
              : `Trick won by ${winnerPlayer?.name} (+${points} pts)!`,
          }));

          setIsTrickEvaluating(true);

          setTimeout(() => {
            setIsTrickEvaluating(false);
            if (endRoundNow) {
              setRoom((prev) => ({
                ...prev,
                status: 'ROUND_END',
                currentTrick: [],
                leadSuit: null,
              }));
            } else {
              setRoom((prev) => ({
                ...prev,
                status: 'PLAYER_TURN',
                turnSeatIndex: winnerSeat,
                trickLeaderSeat: winnerSeat,
                turnDeadline: Date.now() + timerMs,
                leadSuit: null,
                currentTrick: [],
              }));
            }
          }, 3000);
        }
      } else {
        // Round 4 Solitaire Race
        const newSolitaireBoard = updateSolitaireBoard(room.solitaireBoard, card);
        const updatedPlacements = [...room.solitairePlacements];
        const updatedScores = { ...room.scores };
        const updatedTotals = { ...room.totalScores };

        if (updatedHand.length === 0 && !updatedPlacements.some((p) => p.playerId === player.id)) {
          const placeNum = (updatedPlacements.length + 1) as 1 | 2 | 3 | 4;
          const pts = placeNum === 1 ? 0 : placeNum === 2 ? 10 : placeNum === 3 ? 25 : 50;

          updatedPlacements.push({
            playerId: player.id,
            seatIndex: player.seatIndex,
            placement: placeNum,
            timestamp: Date.now(),
            pointsAwarded: pts,
          });

          const pScores = [...(room.scores?.[player.id] || [0, 0, 0, 0])];
          pScores[3] = pts;
          updatedScores[player.id] = pScores;

          Object.keys(updatedScores).forEach((pid) => {
            updatedTotals[pid] = updatedScores[pid].reduce((a, b) => a + b, 0);
          });
        }

        if (updatedPlacements.length === 3) {
          const lastPlayer = room.players.find(
            (p) => !updatedPlacements.some((sp) => sp.playerId === p.id)
          );
          if (lastPlayer) {
            updatedPlacements.push({
              playerId: lastPlayer.id,
              seatIndex: lastPlayer.seatIndex,
              placement: 4,
              timestamp: Date.now(),
              pointsAwarded: 50,
            });
            const pScores = [...(updatedScores[lastPlayer.id] || [0, 0, 0, 0])];
            pScores[3] = 50;
            updatedScores[lastPlayer.id] = pScores;
            Object.keys(updatedScores).forEach((pid) => {
              updatedTotals[pid] = updatedScores[pid].reduce((a, b) => a + b, 0);
            });
          }
        }

        const isGameOver = updatedPlacements.length >= 4 || updatedPlacements.length >= 3;

        if (isGameOver) {
          soundEngine.playVictoryFanfare();
          setIsScoreboardOpen(true);
          setRoom((prev) => ({
            ...prev,
            hands: updatedHands,
            solitaireBoard: newSolitaireBoard,
            solitairePlacements: updatedPlacements,
            scores: updatedScores,
            totalScores: updatedTotals,
            status: 'GAME_OVER',
            lastActionMessage: '🏆 Game Over! All 4 rounds completed!',
          }));
        } else {
          let nextSeat = (room.turnSeatIndex + 1) % 4;
          let loops = 0;
          while (loops < 4) {
            const p = room.players.find((pl) => pl.seatIndex === nextSeat);
            const pHand = p ? (updatedHands[p.id] || []) : [];
            if (pHand.length > 0) break;
            nextSeat = (nextSeat + 1) % 4;
            loops++;
          }

          setRoom((prev) => ({
            ...prev,
            hands: updatedHands,
            solitaireBoard: newSolitaireBoard,
            solitairePlacements: updatedPlacements,
            scores: updatedScores,
            totalScores: updatedTotals,
            turnSeatIndex: nextSeat,
            turnDeadline: Date.now() + timerMs,
            lastActionMessage: `${player.name} placed ${formatCardName(card)}`,
          }));
        }
      }
    },
    [room, humanId]
  );

  // Bot Turn Automated Play Effect
  useEffect(() => {
    if (room.status !== 'PLAYER_TURN' || isTrickEvaluating) return;

    const activePlayer = room.players.find((p) => p.seatIndex === room.turnSeatIndex);
    if (!activePlayer || !activePlayer.isBot) return;

    const hand = room.hands?.[activePlayer.id] || [];
    const playable = getPlayableCards(
      hand,
      room.leadSuit,
      room.currentRound,
      room.solitaireBoard
    );

    const delay = getBotDelay();

    const timer = setTimeout(() => {
      if (room.currentRound === 4 && playable.length === 0) {
        // Pass Turn in Solitaire
        const nextSeat = (room.turnSeatIndex + 1) % 4;
        const timerMs = (room.turnTimerSeconds || 40) * 1000;
        setRoom((prev) => ({
          ...prev,
          turnSeatIndex: nextSeat,
          turnDeadline: Date.now() + timerMs,
          solitairePassedSeats: [...prev.solitairePassedSeats, activePlayer.seatIndex],
          lastActionMessage: `${activePlayer.name} passed turn (no legal move)`,
        }));
      } else if (playable.length > 0) {
        const cardToPlay = pickBotCard(
          hand,
          room.leadSuit,
          room.currentRound,
          room.solitaireBoard,
          room.currentTrick,
          difficulty,
          room,
          activePlayer.seatIndex
        );
        if (cardToPlay) {
          executeCardPlay(activePlayer, cardToPlay);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [room, difficulty, isTrickEvaluating, executeCardPlay]);

  // Start Next Round
  const handleStartNextRound = () => {
    const nextR = (room.currentRound + 1) as RoundNumber;
    if (nextR <= 4) {
      soundEngine.playClick();
      setRoom(
        createInitialSinglePlayerRoom(
          humanId,
          playerName,
          playerAvatar,
          difficulty,
          nextR,
          room.totalScores,
          room.scores
        )
      );
    }
  };

  const currentHuman = room.players.find((p) => p.id === humanId);

  return (
    <div className="flex flex-col h-full w-full bg-[#050705]">
      <SinglePlayerHeaderPanel
        difficulty={difficulty}
        onExitToMenu={onExitToMenu}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenScoreboard={() => setIsScoreboardOpen(true)}
      />

      <div className="flex-1 relative min-h-0">
        <GameBoard
          room={room}
          myPlayerId={humanId}
          onPlayCard={(card) => {
            if (currentHuman) executeCardPlay(currentHuman, card);
          }}
          onPassSolitaire={() => {
            const nextSeat = (room.turnSeatIndex + 1) % 4;
            const timerMs = (room.turnTimerSeconds || 40) * 1000;
            setRoom((prev) => ({
              ...prev,
              turnSeatIndex: nextSeat,
              turnDeadline: Date.now() + timerMs,
              solitairePassedSeats: [...prev.solitairePassedSeats, 0],
              lastActionMessage: 'You passed turn (no legal move)',
            }));
          }}
          onNextRound={handleStartNextRound}
          isEmojiModalOpen={isEmojiModalOpen}
          onToggleEmojiModal={onToggleEmojiModal}
        />

        {/* Game Over Overlay */}
        {room.status === 'GAME_OVER' && (
          <GameOverOverlay
            room={room}
            myPlayerId={humanId}
            onPlayAgain={() => {
              setRoom(
                createInitialSinglePlayerRoom(
                  humanId,
                  playerName,
                  playerAvatar,
                  difficulty,
                  1
                )
              );
            }}
            onExitToMenu={onExitToMenu}
          />
        )}
      </div>

      {/* Modals */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      <ScoreboardModal
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
        room={room}
        myPlayerId={humanId}
      />
    </div>
  );
};
