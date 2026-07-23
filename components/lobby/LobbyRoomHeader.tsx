'use client';

import React, { useState } from 'react';
import { Copy, Check, Clock } from 'lucide-react';
import { RoomState } from '@/lib/types';

interface LobbyRoomHeaderProps {
  room: RoomState;
}

export const LobbyRoomHeader: React.FC<LobbyRoomHeaderProps> = ({ room }) => {
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    if (!room?.roomCode) return;
    const url = `${window.location.origin}?room=${room.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timerSec =
    room.turnTimerSeconds ||
    (room.difficulty === 'EASY' ? 60 : room.difficulty === 'HARD' ? 20 : 40);

  return (
    <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-center space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-red-950/60 border border-red-800/80 rounded-full text-xs font-bold text-red-300">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>
            LOBBY CODE:{' '}
            <span className="text-red-400 font-mono text-sm tracking-widest">{room.roomCode}</span>
          </span>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-950/60 border border-amber-800/80 rounded-full text-xs font-bold text-amber-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Timer: {timerSec}s</span>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white uppercase tracking-tight">
        Waiting for Players ({room.players.length}/4)
      </h2>
      <p className="text-xs text-slate-400">
        Share the 4-character code or link with 3 friends to start the match!
      </p>

      <button
        id="share-lobby-link-btn"
        onClick={copyShareLink}
        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all active:scale-95 shadow"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
        <span>{copied ? 'Copied Room Link!' : 'Copy Shareable Link'}</span>
      </button>
    </div>
  );
};
