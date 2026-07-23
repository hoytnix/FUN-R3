import React from 'react';
import { RoomState } from '@/lib/types';

interface OnlineScorePanelProps {
  room: RoomState;
}

export const OnlineScorePanel: React.FC<OnlineScorePanelProps> = ({ room }) => {
  const getRoundTitle = (r: number) => {
    switch (r) {
      case 1:
        return 'Round 1: Hearts (Avoid Hearts ♥)';
      case 2:
        return 'Round 2: Royal Suite (Avoid J♥, Q♥, K♥)';
      case 3:
        return 'Round 3: Queen of Hearts (Sudden Death 💀)';
      case 4:
        return 'Round 4: Around The World (Solitaire Race 🏎️)';
      default:
        return 'F.U.N.';
    }
  };

  return (
    <div className="flex items-center justify-between z-20 px-1 sm:px-2 py-0.5 shrink-0">
      <div className="flex items-center space-x-1.5 sm:space-x-2 bg-black/60 border border-white/10 px-2 py-1 sm:px-3.5 sm:py-1.5 rounded-full backdrop-blur-md text-[10px] sm:text-xs">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="font-bold text-red-400 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
          {getRoundTitle(room.currentRound)}
        </span>
      </div>

      {room.lastActionMessage && (
        <div className="hidden sm:block text-xs text-slate-300 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full truncate max-w-[240px] backdrop-blur-md">
          {room.lastActionMessage}
        </div>
      )}
    </div>
  );
};
