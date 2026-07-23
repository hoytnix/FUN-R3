'use client';

import React from 'react';
import { RoomState } from '@/lib/types';

interface LobbySeatGridProps {
  room: RoomState;
}

export const LobbySeatGrid: React.FC<LobbySeatGridProps> = ({ room }) => {
  const seats = [0, 1, 2, 3];

  return (
    <div className="w-full grid grid-cols-2 gap-3">
      {seats.map((seatIndex) => {
        const player = room.players.find((p) => p.seatIndex === seatIndex);

        return (
          <div
            key={seatIndex}
            className={`relative rounded-2xl p-4 border flex flex-col items-center justify-center space-y-2 min-h-[120px] transition-all backdrop-blur-md ${
              player
                ? 'bg-black/80 border-white/20 shadow-lg'
                : 'bg-black/30 border-white/10 border-dashed'
            }`}
          >
            {player ? (
              <>
                <div className="relative">
                  <span className="text-3xl">{player.avatar}</span>
                  {player.isHost && (
                    <span className="absolute -top-2 -right-2 text-xs bg-amber-500 text-black px-1.5 py-0.5 rounded-full font-bold shadow">
                      👑
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <div className="font-bold text-sm text-white truncate max-w-[120px]">
                    {player.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 uppercase font-semibold">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        player.connected ? 'bg-green-400' : 'bg-amber-400'
                      }`}
                    />
                    <span>{player.connected ? 'Human Connected' : 'Connecting'}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto text-xs font-bold">
                  {seatIndex + 1}
                </div>
                <span className="text-xs text-slate-500 font-medium animate-pulse">Waiting for Human...</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
