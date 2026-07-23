'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player, RoomState } from '@/lib/types';

interface ScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomState;
  myPlayerId: string;
}

export const ScoreboardModal: React.FC<ScoreboardModalProps> = ({
  isOpen,
  onClose,
  room,
  myPlayerId,
}) => {
  const isGameOver = room.status === 'GAME_OVER';

  // Trigger confetti when game ends
  useEffect(() => {
    if (isGameOver && isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isGameOver, isOpen]);

  if (!isOpen) return null;

  // Sort players by total score ascending (lowest score wins!)
  const sortedPlayers = [...room.players].sort((a, b) => {
    const scoreA = room.totalScores?.[a.id] ?? 0;
    const scoreB = room.totalScores?.[b.id] ?? 0;
    return scoreA - scoreB;
  });

  const getRankBadge = (idx: number) => {
    switch (idx) {
      case 0: return { label: '1st 🥇', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 1: return { label: '2nd 🥈', color: 'bg-slate-400/20 text-slate-300 border-slate-400/40' };
      case 2: return { label: '3rd 🥉', color: 'bg-amber-700/20 text-amber-500 border-amber-700/40' };
      default: return { label: '4th 💀', color: 'bg-rose-900/20 text-rose-400 border-rose-800/40' };
    }
  };

  return (
    <div
      id="scoreboard-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="scoreboard-card"
        className="bg-black/90 border border-white/10 text-slate-100 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-5 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{isGameOver ? '🏆' : '📊'}</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                {isGameOver ? 'Final Standings & Winner!' : 'Match Leaderboard'}
              </h2>
              <p className="text-xs text-slate-400">
                Lowest score wins • Round {room.currentRound} of 4
              </p>
            </div>
          </div>
          <button
            id="close-scoreboard-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* Winner Highlight Card on Game Over */}
        {isGameOver && sortedPlayers[0] && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-center space-y-1 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
            <div className="text-3xl">👑</div>
            <div className="text-lg font-black text-amber-300 uppercase">
              {sortedPlayers[0].name} Wins!
            </div>
            <div className="text-xs text-slate-300 font-semibold">
              Final Score: <span className="text-amber-400 font-bold">{room.totalScores?.[sortedPlayers[0].id] ?? 0} pts</span>
            </div>
          </div>
        )}

        {/* Scores Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/60">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white/5 text-slate-400 font-semibold border-b border-white/10 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-2.5">Player</th>
                <th className="p-2.5 text-center">R1</th>
                <th className="p-2.5 text-center">R2</th>
                <th className="p-2.5 text-center">R3</th>
                <th className="p-2.5 text-center">R4</th>
                <th className="p-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {sortedPlayers.map((player, rankIdx) => {
                const rank = getRankBadge(rankIdx);
                const isMe = player.id === myPlayerId;
                const pScores = room.scores?.[player.id] || [0, 0, 0, 0];
                const total = room.totalScores?.[player.id] ?? 0;

                return (
                  <tr
                    key={player.id}
                    className={isMe ? 'bg-red-950/30 font-semibold' : 'hover:bg-white/5'}
                  >
                    <td className="p-2.5">
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${rank.color}`}>
                          {rank.label}
                        </span>
                        <span className="text-lg">{player.avatar}</span>
                        <span className="truncate max-w-[100px] sm:max-w-[130px] font-bold text-white">
                          {player.name} {isMe && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center text-slate-300">{pScores[0] ?? 0}</td>
                    <td className="p-2.5 text-center text-slate-300">{pScores[1] ?? 0}</td>
                    <td className="p-2.5 text-center text-slate-300">{pScores[2] ?? 0}</td>
                    <td className="p-2.5 text-center text-slate-300">{pScores[3] ?? 0}</td>
                    <td className="p-2.5 text-right font-black text-amber-400 text-base">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Round Explanations Footer */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <span className="font-bold text-rose-400">R1 Hearts:</span> Avoid Hearts (+5)
          </div>
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <span className="font-bold text-indigo-400">R2 Royals:</span> Avoid Heart Royals (+15)
          </div>
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <span className="font-bold text-amber-400">R3 Sudden Death:</span> Q♥ ends round (+50)
          </div>
          <div className="p-2 bg-slate-800/40 rounded-lg">
            <span className="font-bold text-emerald-400">R4 Solitaire:</span> 1st=0, 2nd=10, 3rd=25, 4th=50
          </div>
        </div>

        <button
          id="close-scoreboard-action-btn"
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
        >
          Close Leaderboard
        </button>
      </div>
    </div>
  );
};
