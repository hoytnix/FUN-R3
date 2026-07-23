import { useCallback } from 'react';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from '@/lib/firebase';
import {
  RoomState,
  Player,
  Card,
  RoundNumber,
  ChatMessage,
  FloatingReaction,
} from '@/lib/types';
import {
  createDeck,
  dealHands,
  evaluateTrickWinner,
  calculateTrickPoints,
  createInitialSolitaireBoard,
  updateSolitaireBoard,
  getPlayableCards,
  formatCardName,
} from '@/lib/game-engine';
import { soundEngine } from '@/lib/audio';
import { pickBotCard } from '@/lib/bot-engine';

export function useOnlineRoomActions(
  myPlayerId: string,
  onOpenScoreboard: () => void
) {
  // Execute online card play
  const executeOnlineCardPlay = useCallback(
    async (currentRoom: RoomState, player: Player, card: Card) => {
      soundEngine.playCardSnap();
      const roomDocRef = doc(db, 'rooms', currentRoom.roomCode);
      const playerHand = currentRoom.hands?.[player.id] || [];
      const updatedHand = playerHand.filter((c) => c.id !== card.id);
      const updatedHands = { ...currentRoom.hands, [player.id]: updatedHand };
      const onlineTimerMs =
        (currentRoom.turnTimerSeconds ||
          (currentRoom.difficulty === 'EASY' ? 60 : currentRoom.difficulty === 'HARD' ? 20 : 40)) *
        1000;

      if (currentRoom.currentRound <= 3) {
        const newTrickCard = {
          playerId: player.id,
          seatIndex: player.seatIndex,
          card,
        };

        const updatedTrick = [...currentRoom.currentTrick, newTrickCard];
        const newLeadSuit = currentRoom.leadSuit || card.suit;

        if (updatedTrick.length < 4) {
          const nextSeat = (currentRoom.turnSeatIndex + 1) % 4;
          await updateDoc(roomDocRef, {
            hands: updatedHands,
            currentTrick: updatedTrick,
            leadSuit: newLeadSuit,
            turnSeatIndex: nextSeat,
            turnDeadline: Date.now() + onlineTimerMs,
            lastActionMessage: `${player.name} played ${formatCardName(card)}`,
          });
        } else {
          const winnerTrickCard = evaluateTrickWinner(updatedTrick, newLeadSuit);
          const winnerPlayer = currentRoom.players.find((p) => p.id === winnerTrickCard.playerId);
          const { points, isSuddenDeath } = calculateTrickPoints(updatedTrick, currentRoom.currentRound);

          const winnerId = winnerTrickCard.playerId;
          const currentScores = currentRoom.scores?.[winnerId] || [0, 0, 0, 0];
          const newScoresForPlayer = [...currentScores];
          newScoresForPlayer[currentRoom.currentRound - 1] += points;

          const updatedScores = {
            ...currentRoom.scores,
            [winnerId]: newScoresForPlayer,
          };

          const updatedTotals = { ...currentRoom.totalScores };
          Object.keys(updatedScores).forEach((pid) => {
            updatedTotals[pid] = updatedScores[pid].reduce((a, b) => a + b, 0);
          });

          const currentCount = currentRoom.tricksTakenCount?.[winnerId] || 0;
          const updatedTricksTakenCount = {
            ...currentRoom.tricksTakenCount,
            [winnerId]: currentCount + 1,
          };

          const isHandEmpty = updatedHand.length === 0;
          const allHandsEmpty = isHandEmpty && Object.values(updatedHands).every((h) => h.length === 0);
          const endRoundNow = allHandsEmpty || isSuddenDeath;

          if (isSuddenDeath) {
            soundEngine.playSuddenDeath();
          } else {
            soundEngine.playTrickSweep();
          }
          await updateDoc(roomDocRef, {
            hands: updatedHands,
            currentTrick: updatedTrick,
            leadSuit: newLeadSuit,
            scores: updatedScores,
            totalScores: updatedTotals,
            tricksTakenCount: updatedTricksTakenCount,
            lastCompletedTrick: {
              cards: updatedTrick,
              winnerPlayerId: winnerId,
              winnerSeatIndex: winnerTrickCard.seatIndex,
              pointsAwarded: points,
              roundNumber: currentRoom.currentRound,
            },
            lastActionMessage: isSuddenDeath
              ? `💀 Queen of Hearts taken by ${winnerPlayer?.name}! Round 3 Ended (+50 pts).`
              : `${winnerPlayer?.name} won the trick (+${points} pts)`,
          });

          setTimeout(async () => {
            try {
              const freshSnap = await getDoc(roomDocRef);
              if (!freshSnap.exists()) return;
              const freshData = freshSnap.data() as RoomState;
              if (freshData.currentTrick?.length === 4) {
                if (endRoundNow) {
                  await updateDoc(roomDocRef, {
                    status: 'ROUND_END',
                    currentTrick: [],
                    leadSuit: null,
                  });
                } else {
                  await updateDoc(roomDocRef, {
                    status: 'PLAYER_TURN',
                    turnSeatIndex: winnerTrickCard.seatIndex,
                    trickLeaderSeat: winnerTrickCard.seatIndex,
                    turnDeadline: Date.now() + onlineTimerMs,
                    leadSuit: null,
                    currentTrick: [],
                  });
                }
              }
            } catch (err) {
              console.error('Error resolving online trick:', err);
            }
          }, 800);
        }
      } else {
        const newSolitaireBoard = updateSolitaireBoard(currentRoom.solitaireBoard, card);
        const updatedPlacements = [...currentRoom.solitairePlacements];
        const updatedScores = { ...currentRoom.scores };
        const updatedTotals = { ...currentRoom.totalScores };

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

          const pScores = [...(currentRoom.scores?.[player.id] || [0, 0, 0, 0])];
          pScores[3] = pts;
          updatedScores[player.id] = pScores;

          Object.keys(updatedScores).forEach((pid) => {
            updatedTotals[pid] = updatedScores[pid].reduce((a, b) => a + b, 0);
          });
        }

        if (updatedPlacements.length === 3) {
          const lastPlayer = currentRoom.players.find(
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
          onOpenScoreboard();
          await updateDoc(roomDocRef, {
            hands: updatedHands,
            solitaireBoard: newSolitaireBoard,
            solitairePlacements: updatedPlacements,
            scores: updatedScores,
            totalScores: updatedTotals,
            status: 'GAME_OVER',
            lastActionMessage: '🏆 Game Over! All 4 rounds completed!',
          });
        } else {
          let nextSeat = (currentRoom.turnSeatIndex + 1) % 4;
          let loops = 0;
          while (loops < 4) {
            const p = currentRoom.players.find((pl) => pl.seatIndex === nextSeat);
            const pHand = p ? (updatedHands[p.id] || []) : [];
            if (pHand.length > 0) break;
            nextSeat = (nextSeat + 1) % 4;
            loops++;
          }

          await updateDoc(roomDocRef, {
            hands: updatedHands,
            solitaireBoard: newSolitaireBoard,
            solitairePlacements: updatedPlacements,
            scores: updatedScores,
            totalScores: updatedTotals,
            turnSeatIndex: nextSeat,
            turnDeadline: Date.now() + onlineTimerMs,
            lastActionMessage: `${player.name} placed ${formatCardName(card)}`,
          });
        }
      }
    },
    [onOpenScoreboard]
  );

  const handleOnlinePassSolitaire = useCallback(async (currentRoom: RoomState, player: Player) => {
    let nextSeat = (currentRoom.turnSeatIndex + 1) % 4;
    let loops = 0;
    while (loops < 4) {
      const p = currentRoom.players.find((pl) => pl.seatIndex === nextSeat);
      const pHand = p ? (currentRoom.hands?.[p.id] || []) : [];
      if (pHand.length > 0) break;
      nextSeat = (nextSeat + 1) % 4;
      loops++;
    }
    const onlineTimerMs =
      (currentRoom.turnTimerSeconds ||
        (currentRoom.difficulty === 'EASY' ? 60 : currentRoom.difficulty === 'HARD' ? 20 : 40)) *
      1000;
    await updateDoc(doc(db, 'rooms', currentRoom.roomCode), {
      turnSeatIndex: nextSeat,
      turnDeadline: Date.now() + onlineTimerMs,
      solitairePassedSeats: arrayUnion(player.seatIndex),
      lastActionMessage: `${player.name} passed turn (no legal move)`,
    });
  }, []);

  const handleAutoPlayTurn = useCallback(
    async (currentRoom: RoomState) => {
      const activePlayer = currentRoom.players.find((p) => p.seatIndex === currentRoom.turnSeatIndex);
      if (!activePlayer) return;

      const hand = currentRoom.hands?.[activePlayer.id] || [];
      const playable = getPlayableCards(
        hand,
        currentRoom.leadSuit,
        currentRoom.currentRound,
        currentRoom.solitaireBoard
      );

      if (currentRoom.currentRound === 4 && playable.length === 0) {
        await handleOnlinePassSolitaire(currentRoom, activePlayer);
        return;
      }

      let cardToPlay: Card | null = null;
      if (activePlayer.isBot) {
        cardToPlay = pickBotCard(
          hand,
          currentRoom.leadSuit,
          currentRoom.currentRound,
          currentRoom.solitaireBoard,
          currentRoom.currentTrick,
          currentRoom.difficulty,
          currentRoom,
          activePlayer.seatIndex
        );
      } else if (playable.length > 0) {
        const randomIndex = Math.floor(Math.random() * playable.length);
        cardToPlay = playable[randomIndex];
      }

      if (cardToPlay) {
        await executeOnlineCardPlay(currentRoom, activePlayer, cardToPlay);
      }
    },
    [handleOnlinePassSolitaire, executeOnlineCardPlay]
  );

  const startOnlineRound = useCallback(
    async (currentRoom: RoomState, roundNum: RoundNumber) => {
      const deck = createDeck();
      const dealt = dealHands(deck);

      const handsByPlayerId: Record<string, Card[]> = {};
      currentRoom.players.forEach((p) => {
        handsByPlayerId[p.id] = dealt[p.seatIndex.toString()] || [];
      });

      let firstLeader = Math.floor(Math.random() * 4);
      if (roundNum === 4) {
        for (const p of currentRoom.players) {
          const pHand = handsByPlayerId[p.id] || [];
          if (pHand.some((c) => c.suit === 'HEARTS' && c.value === 7)) {
            firstLeader = p.seatIndex;
            break;
          }
        }
      }
      const roundTimerMs =
        (currentRoom.turnTimerSeconds ||
          (currentRoom.difficulty === 'EASY' ? 60 : currentRoom.difficulty === 'HARD' ? 20 : 40)) *
        1000;

      await updateDoc(doc(db, 'rooms', currentRoom.roomCode), {
        status: 'PLAYER_TURN',
        currentRound: roundNum,
        turnSeatIndex: firstLeader,
        trickLeaderSeat: firstLeader,
        turnDeadline: Date.now() + roundTimerMs,
        leadSuit: null,
        currentTrick: [],
        lastCompletedTrick: null,
        hands: handsByPlayerId,
        playedCardsHistory: [],
        solitaireBoard: createInitialSolitaireBoard(),
        solitairePlacements: [],
        solitairePassedSeats: [],
        lastActionMessage: `Round ${roundNum} started! Dealt 13 cards to each player (${currentRoom.turnTimerSeconds || 40}s turn timer).`,
      });
    },
    []
  );

  const handleSendOnlineMessage = useCallback(
    async (room: RoomState | null, text: string) => {
      if (!room) return;
      const me = room.players.find((p) => p.id === myPlayerId);
      if (!me) return;

      const newMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        playerId: myPlayerId,
        playerName: me.name,
        text,
        timestamp: Date.now(),
      };

      const updatedMsgs = [...(room.chatMessages || []).slice(-20), newMsg];
      await updateDoc(doc(db, 'rooms', room.roomCode), {
        chatMessages: updatedMsgs,
      });
    },
    [myPlayerId]
  );

  const handleSendOnlineReaction = useCallback(
    async (room: RoomState | null, emoji: string) => {
      if (!room) return;

      const newReaction: FloatingReaction = {
        id: Math.random().toString(36).substring(2, 9),
        playerId: myPlayerId,
        emoji,
        timestamp: Date.now(),
      };

      const updatedReactions = [...(room.reactions || []).slice(-15), newReaction];
      await updateDoc(doc(db, 'rooms', room.roomCode), {
        reactions: updatedReactions,
      });
    },
    [myPlayerId]
  );

  return {
    executeOnlineCardPlay,
    handleOnlinePassSolitaire,
    handleAutoPlayTurn,
    startOnlineRound,
    handleSendOnlineMessage,
    handleSendOnlineReaction,
  };
}
