'use client';

import React from 'react';
import { Suit, SolitaireBoard } from '@/lib/types';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { Flame } from 'lucide-react';

interface SolitaireBoardViewProps {
  solitaireBoard?: SolitaireBoard;
  board?: SolitaireBoard;
  isMyTurn?: boolean;
  hasPlayableCards?: boolean;
  onPassSolitaire?: () => void;
}

export const SolitaireBoardView: React.FC<SolitaireBoardViewProps> = ({
  solitaireBoard: propSolitaireBoard,
  board,
  isMyTurn = false,
  hasPlayableCards = false,
  onPassSolitaire,
}) => {
  const solitaireBoard = propSolitaireBoard || board;
  return (
    <div className="w-full h-full p-0.5 sm:p-2 short:p-0.5 overflow-y-auto flex flex-col space-y-0.5 sm:space-y-2 short:space-y-0.5 z-10 justify-center max-w-md mx-auto">
      <div className="text-center text-[10px] sm:text-xs short:text-[9px] font-bold text-green-400 flex items-center justify-center space-x-1 uppercase tracking-wider">
        <Flame className="w-3 h-3 sm:w-4 sm:h-4 short:w-2.5 short:h-2.5 text-red-500" />
        <span>Around The World Lanes</span>
      </div>

      {(['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as Suit[]).map((suit) => {
        const placed = solitaireBoard?.placed[suit] || [];
        const minAvail = solitaireBoard?.minAvailable[suit];
        const maxAvail = solitaireBoard?.maxAvailable[suit];

        return (
          <div
            key={suit}
            className="bg-black/60 border border-white/10 p-0.5 sm:p-1.5 short:p-0.5 rounded-lg sm:rounded-2xl flex items-center space-x-1"
          >
            <div className="w-5 sm:w-8 short:w-4 text-center font-black text-[9px] sm:text-xs short:text-[8px] text-red-400 shrink-0">
              {suit[0]}
            </div>

            <div className="flex-1 flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto touch-pan-x overscroll-x-contain no-scrollbar py-0.5">
              {placed.length === 0 ? (
                <div className="text-[8px] sm:text-[10px] short:text-[7px] text-slate-500 italic">Needs 7 to open</div>
              ) : (
                placed.slice().sort((a, b) => a - b).map((val) => (
                  <PlayingCard
                    key={`${suit}-${val}`}
                    card={{ id: `${suit}-${val}`, suit, value: val as any }}
                    size="xs"
                    className="w-7 h-10.5 xs:w-8 xs:h-12 sm:w-10 sm:h-15 short:w-6 short:h-9 shrink-0"
                  />
                ))
              )}
            </div>

            <div className="text-[7px] sm:text-[9px] short:text-[6px] text-slate-400 font-mono flex flex-col text-right shrink-0">
              <span>L: {minAvail ?? '-'}</span>
              <span>H: {maxAvail ?? '-'}</span>
            </div>
          </div>
        );
      })}

      {/* Solitaire Pass button if no moves */}
      {isMyTurn && !hasPlayableCards && (
        <button
          id="solitaire-pass-btn"
          onClick={onPassSolitaire}
          className="w-full py-1.5 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] cursor-pointer"
        >
          No Legal Moves — Click to PASS
        </button>
      )}
    </div>
  );
};
