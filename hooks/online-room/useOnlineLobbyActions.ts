import { useCallback, useState } from 'react';
import {
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from '@/lib/firebase';
import { RoomState, Player } from '@/lib/types';
import { BotDifficulty } from '@/lib/bot-engine';
import { createInitialSolitaireBoard } from '@/lib/game-engine';

export function useOnlineLobbyActions(
  myPlayerId: string,
  listenToRoom: (code: string) => () => void,
  setRoom: (room: RoomState | null) => void
) {
  const [loading, setLoading] = useState<boolean>(false);

  // Create Online Room
  const handleCreateRoom = useCallback(
    async (
      name: string,
      avatar: string,
      turnTimerSeconds: number = 40,
      difficulty: BotDifficulty = 'MEDIUM'
    ) => {
      setLoading(true);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      const newPlayer: Player = {
        id: myPlayerId,
        name,
        avatar,
        seatIndex: 0,
        isHost: true,
        isBot: false,
        connected: true,
        lastSeen: Date.now(),
      };

      const initialRoom: RoomState = {
        roomCode: code,
        createdAt: Date.now(),
        status: 'LOBBY_WAITING',
        currentRound: 1,
        hostId: myPlayerId,
        players: [newPlayer],
        turnSeatIndex: 0,
        turnDeadline: 0,
        turnTimerSeconds,
        difficulty,
        leadSuit: null,
        currentTrick: [],
        trickLeaderSeat: 0,
        lastCompletedTrick: null,
        scores: { [myPlayerId]: [0, 0, 0, 0] },
        totalScores: { [myPlayerId]: 0 },
        hands: {},
        tricksTakenCount: {},
        solitaireBoard: createInitialSolitaireBoard(),
        solitairePlacements: [],
        solitairePassedSeats: [],
        chatMessages: [],
        reactions: [],
        lastActionMessage: `Room created with ${turnTimerSeconds}s timer. Waiting for players...`,
      };

      await setDoc(doc(db, 'rooms', code), initialRoom);
      listenToRoom(code);
      setLoading(false);
    },
    [myPlayerId, listenToRoom]
  );

  // Join Online Room
  const handleJoinRoom = useCallback(
    async (code: string, name: string, avatar: string) => {
      setLoading(true);
      const roomDocRef = doc(db, 'rooms', code);
      const snap = await getDoc(roomDocRef);

      if (!snap.exists()) {
        alert('Room not found! Please check the 4-digit code.');
        setLoading(false);
        return;
      }

      const data = snap.data() as RoomState;
      const existingPlayer = data.players.find((p) => p.id === myPlayerId);

      if (existingPlayer) {
        listenToRoom(code);
        setLoading(false);
        return;
      }

      if (data.players.length >= 4) {
        alert('Room is already full (4/4 players)!');
        setLoading(false);
        return;
      }

      const availableSeats = [0, 1, 2, 3].filter(
        (s) => !data.players.some((p) => p.seatIndex === s)
      );
      const nextSeat = availableSeats[0] ?? data.players.length;

      const newPlayer: Player = {
        id: myPlayerId,
        name,
        avatar,
        seatIndex: nextSeat,
        isHost: false,
        isBot: false,
        connected: true,
        lastSeen: Date.now(),
      };

      const updatedPlayers = [...data.players, newPlayer];
      const updatedScores = { ...data.scores, [myPlayerId]: [0, 0, 0, 0] };
      const updatedTotals = { ...data.totalScores, [myPlayerId]: 0 };

      await updateDoc(roomDocRef, {
        players: updatedPlayers,
        scores: updatedScores,
        totalScores: updatedTotals,
        lastActionMessage: `${name} joined the room!`,
      });

      listenToRoom(code);
      setLoading(false);
    },
    [myPlayerId, listenToRoom]
  );

  const handleAddBot = useCallback(async (room: RoomState | null) => {
    if (!room) return;
    if (room.players.length >= 4) return;

    const availableSeats = [0, 1, 2, 3].filter(
      (s) => !room.players.some((p) => p.seatIndex === s)
    );
    const botSeat = availableSeats[0];
    const botId = `bot_${Math.random().toString(36).substring(2, 7)}`;
    const botNum = room.players.filter((p) => p.isBot).length + 1;

    const botPlayer: Player = {
      id: botId,
      name: `Bot ${botNum} 🤖`,
      avatar: '🤖',
      seatIndex: botSeat,
      isHost: false,
      isBot: true,
      connected: true,
      lastSeen: Date.now(),
    };

    const updatedPlayers = [...room.players, botPlayer];
    const updatedScores = { ...room.scores, [botId]: [0, 0, 0, 0] };
    const updatedTotals = { ...room.totalScores, [botId]: 0 };

    await updateDoc(doc(db, 'rooms', room.roomCode), {
      players: updatedPlayers,
      scores: updatedScores,
      totalScores: updatedTotals,
    });
  }, []);

  const handleRemoveBot = useCallback(async (room: RoomState | null, seatIndex: number) => {
    if (!room) return;
    const updatedPlayers = room.players.filter((p) => p.seatIndex !== seatIndex);
    await updateDoc(doc(db, 'rooms', room.roomCode), {
      players: updatedPlayers,
    });
  }, []);

  const leaveOnlineRoom = useCallback(() => {
    localStorage.removeItem('fun_roomCode');
    setRoom(null);
  }, [setRoom]);

  return {
    loading,
    handleCreateRoom,
    handleJoinRoom,
    handleAddBot,
    handleRemoveBot,
    leaveOnlineRoom,
  };
}
