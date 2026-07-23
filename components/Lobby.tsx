'use client';

import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';
import { RoomState, BotDifficulty } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { LobbyRoomHeader } from './lobby/LobbyRoomHeader';
import { LobbySeatGrid } from './lobby/LobbySeatGrid';
import { LobbyRoomControls } from './lobby/LobbyRoomControls';

interface LobbyProps {
  room?: RoomState | null;
  myPlayerId: string;
  onCreateRoom: (name: string, avatar: string, turnTimerSeconds?: number, difficulty?: BotDifficulty) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  onStartGame: () => void;
  onAddBot?: () => void;
  onRemoveBot?: (seatIndex: number) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  room,
  myPlayerId,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
}) => {
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fun_playerName') || 'Player ' + Math.floor(1000 + Math.random() * 9000);
    }
    return 'Player ' + Math.floor(1000 + Math.random() * 9000);
  });
  const [avatar, setAvatar] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fun_playerAvatar') || '🖕';
    }
    return '🖕';
  });
  const [selectedTimer, setSelectedTimer] = useState<number>(40);
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('room')?.toUpperCase() || '';
    }
    return '';
  });
  const [tab, setTab] = useState<'create' | 'join'>(() => (joinCode ? 'join' : 'create'));

  const me = room?.players.find((p) => p.id === myPlayerId);
  const isHost = me?.isHost || room?.hostId === myPlayerId;
  const humanPlayersCount = room?.players.filter((p) => !p.isBot).length ?? 0;
  const isFull = humanPlayersCount === 4;

  const handleCreate = () => {
    if (!name.trim()) return;
    soundEngine.playClick();
    localStorage.setItem('fun_playerName', name.trim());
    localStorage.setItem('fun_playerAvatar', avatar);
    const difficultyMap: Record<number, BotDifficulty> = {
      60: 'EASY',
      40: 'MEDIUM',
      20: 'HARD',
    };
    onCreateRoom(name.trim(), avatar, selectedTimer, difficultyMap[selectedTimer] || 'MEDIUM');
  };

  const handleJoin = () => {
    if (!name.trim() || !joinCode.trim()) return;
    soundEngine.playClick();
    localStorage.setItem('fun_playerName', name.trim());
    localStorage.setItem('fun_playerAvatar', avatar);
    onJoinRoom(joinCode.trim().toUpperCase(), name.trim(), avatar);
  };

  // If in an active waiting room
  if (room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-32px)] p-4 max-w-lg mx-auto select-none space-y-6">
        {/* Room Header Card */}
        <LobbyRoomHeader room={room} />

        {/* Seats Grid */}
        <LobbySeatGrid room={room} />

        {/* Action Controls */}
        <div className="w-full space-y-3 pt-2">
          {isHost ? (
            <button
              id="start-game-btn"
              disabled={!isFull}
              onClick={onStartGame}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 transition-all ${
                isFull
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] cursor-pointer uppercase tracking-wider'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{isFull ? 'START MATCH NOW!' : 'Need 4 Players to Start'}</span>
            </button>
          ) : (
            <div className="p-4 bg-black/60 border border-white/10 rounded-2xl text-center text-xs text-slate-400 animate-pulse">
              Waiting for the match host to launch...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Create or Join Flow
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-32px)] p-4 max-w-md mx-auto select-none space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(220,38,38,0.5)] mx-auto font-bold text-white">
          🖕
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
          UR NEIGHBOR
        </h1>
        <p className="text-xs text-red-500 font-bold tracking-[0.2em] uppercase">
          4-Player Real-Time Multiplayer Card Match
        </p>
      </div>

      {/* Main Container Controls Card */}
      <LobbyRoomControls
        name={name}
        setName={setName}
        avatar={avatar}
        setAvatar={setAvatar}
        selectedTimer={selectedTimer}
        setSelectedTimer={setSelectedTimer}
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        tab={tab}
        setTab={setTab}
        onCreate={handleCreate}
        onJoin={handleJoin}
      />

      {/* Feature Badges */}
      <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Sync</span>
        </div>
        <span>•</span>
        <span>60s / 40s / 20s Timers</span>
        <span>•</span>
        <span>Around The World Final</span>
      </div>
    </div>
  );
};
