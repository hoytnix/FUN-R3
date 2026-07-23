'use client';

import React from 'react';
import { RoomState } from '@/lib/types';
import { ConfettiOverlay } from '@/components/game/ConfettiOverlay';
import { PartyPopper } from 'lucide-react';

interface GameOverOverlayProps {
  room: RoomState;
  onPlayAgain: () => void;
  onExitToMenu: () => void;
  myPlayerId?: string;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  room,
  onPlayAgain,
  onExitToMenu,
  myPlayerId,
}) => {
  const sortedPlayers = room.players
    .slice()
    .sort((a, b) => (room.totalScores?.[a.id] ?? 0) - (room.totalScores?.[b.id] ?? 0));

  const winner = sortedPlayers[0];
  const winnerScore = winner ? room.totalScores?.[winner.id] ?? 0 : 0;
  const isMyWin = myPlayerId ? winner?.id === myPlayerId : false;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center space-y-6">
      {/* Confetti Animation Overlay */}
      <ConfettiOverlay
        winnerName={winner?.name}
        winnerAvatar={winner?.avatar}
        winnerScore={winnerScore}
        isMyWin={isMyWin}
        showBanner={false}
      />

      <div className="relative">
        <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-3xl flex items-center justify-center text-5xl shadow-[0_0_35px_rgba(245,158,11,0.6)] animate-pulse">
          🏆
        </div>
        <div className="absolute -top-3 -right-3 text-3xl animate-bounce">👑</div>
      </div>

      <div className="space-y-2 max-w-sm">
        <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          MATCH COMPLETE!
        </h2>
        {winner && (
          <div className="p-3 bg-amber-950/60 border border-amber-500/50 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <p className="text-xs text-amber-400 font-black uppercase tracking-widest">
              🏆 Champion
            </p>
            <p className="text-xl font-black text-white mt-0.5 flex items-center justify-center space-x-2">
              <span>{winner.avatar}</span>
              <span>{winner.name}</span>
            </p>
            <p className="text-xs text-amber-300 font-mono font-bold mt-0.5">
              Lowest Total Score: {winnerScore} pts
            </p>
          </div>
        )}
      </div>

      {/* Leaderboard Summary */}
      <div className="w-full max-w-sm bg-black/80 border border-white/10 rounded-2xl p-4 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left pb-1 border-b border-white/10 flex items-center justify-between">
          <span>Final Standings</span>
          <span className="text-amber-400 font-mono">F.U.N. Rules</span>
        </div>

        {sortedPlayers.map((p, idx) => (
          <div
            key={p.id}
            className={`flex items-center justify-between p-3 rounded-xl border ${
              idx === 0
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 font-bold shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs w-5 font-black">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '4.'}
              </span>
              <span className="text-xl">{p.avatar}</span>
              <span className="text-sm truncate max-w-[120px]">{p.name}</span>
            </div>
            <span className="font-mono text-sm font-black text-amber-400">
              {room.totalScores?.[p.id] ?? 0} pts
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] uppercase tracking-wider cursor-pointer transition-all active:scale-95"
        >
          Play Again
        </button>
        <button
          onClick={onExitToMenu}
          className="px-6 py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/5 text-slate-200 font-bold text-sm rounded-xl border border-white/10 uppercase cursor-pointer transition-all active:scale-95"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
};
