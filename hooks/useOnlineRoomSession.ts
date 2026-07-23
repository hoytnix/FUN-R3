import { useState, useEffect, useCallback } from 'react';
import { db, doc, onSnapshot, getDoc } from '@/lib/firebase';
import { RoomState, RoundNumber } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { useOnlineLobbyActions } from './online-room/useOnlineLobbyActions';
import { useOnlineRoomActions } from './online-room/useOnlineRoomActions';

export function useOnlineRoomSession(
  myPlayerId: string,
  mode: string,
  onOpenScoreboard: () => void
) {
  const [room, setRoom] = useState<RoomState | null>(null);

  // Listen to Firestore Room Document in real-time
  const listenToRoom = useCallback((code: string) => {
    const roomDocRef = doc(db, 'rooms', code);
    return onSnapshot(roomDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as RoomState;
        setRoom(data);
        localStorage.setItem('fun_roomCode', code);
      } else {
        setRoom(null);
        localStorage.removeItem('fun_roomCode');
      }
    });
  }, []);

  // Auto reconnect to online room if code in URL or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room')?.toUpperCase();
    const savedRoomCode = roomFromUrl || localStorage.getItem('fun_roomCode');

    if (savedRoomCode) {
      const roomDocRef = doc(db, 'rooms', savedRoomCode);
      getDoc(roomDocRef)
        .then((snap) => {
          if (snap.exists()) {
            listenToRoom(savedRoomCode);
          }
        })
        .catch(() => {});
    }
  }, [listenToRoom]);

  const lobbyActions = useOnlineLobbyActions(myPlayerId, listenToRoom, setRoom);
  const roomActions = useOnlineRoomActions(myPlayerId, onOpenScoreboard);

  // Host Authoritative Loop for Online Mode
  useEffect(() => {
    if (mode !== 'ONLINE' || !room) return;

    const me = room.players.find((p) => p.id === myPlayerId);
    const isHost = me?.isHost || room.hostId === myPlayerId;

    if (!isHost || room.status !== 'PLAYER_TURN') return;

    const activePlayer = room.players.find((p) => p.seatIndex === room.turnSeatIndex);
    const isBot = activePlayer?.isBot;
    const isTimedOut = Date.now() > room.turnDeadline && room.turnDeadline > 0;

    if (isBot || isTimedOut) {
      const timer = setTimeout(() => {
        roomActions.handleAutoPlayTurn(room);
      }, isBot ? 1000 : 500);

      return () => clearTimeout(timer);
    }
  }, [room, myPlayerId, mode, roomActions]);

  const handleStartOnlineGame = async () => {
    if (!room) return;
    soundEngine.playClick();
    await roomActions.startOnlineRound(room, 1);
  };

  const handleNextOnlineRound = async () => {
    if (!room) return;
    const nextR = (room.currentRound + 1) as RoundNumber;
    if (nextR <= 4) {
      await roomActions.startOnlineRound(room, nextR);
    }
  };

  return {
    room,
    loading: lobbyActions.loading,
    executeOnlineCardPlay: roomActions.executeOnlineCardPlay,
    handleOnlinePassSolitaire: roomActions.handleOnlinePassSolitaire,
    handleCreateRoom: lobbyActions.handleCreateRoom,
    handleJoinRoom: lobbyActions.handleJoinRoom,
    handleAddBot: () => lobbyActions.handleAddBot(room),
    handleRemoveBot: (seatIndex: number) => lobbyActions.handleRemoveBot(room, seatIndex),
    handleStartOnlineGame,
    handleNextOnlineRound,
    handleSendOnlineMessage: (text: string) => roomActions.handleSendOnlineMessage(room, text),
    handleSendOnlineReaction: (emoji: string) => roomActions.handleSendOnlineReaction(room, emoji),
    leaveOnlineRoom: lobbyActions.leaveOnlineRoom,
  };
}
