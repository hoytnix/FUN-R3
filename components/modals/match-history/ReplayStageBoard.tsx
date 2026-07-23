'use client';

import React from 'react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { cn } from '@/lib/utils';
import { MatchRecord, ReplayStepState } from '@/lib/types/replay';
import { Suit } from '@/lib/types';

interface ReplayStageBoardProps {
  selectedMatch: MatchRecord;
  stepState: ReplayStepState | null;
}

export const ReplayStageBoard: React.FC<ReplayStageBoardProps> = ({
  selectedMatch,
  stepState,
}) => {
  return (
    <div className="flex-1 relative flex flex-col justify-between p-2 sm:p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f18] to-[#04060a] overflow-hidden">
      {/* NORTH PLAYER (SEAT 2) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        <div
          className={cn(
            'px-3 py-1 rounded-full border flex items-center space-x-2 text-xs font-bold transition-all',
            stepState?.activeSeat === 2
              ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
              : 'bg-slate-900/90 text-slate-300 border-slate-800'
          )}
        >
          <span>{selectedMatch.players.find((p) => p.seatIndex === 2)?.avatar || '⚡'}</span>
          <span>{selectedMatch.players.find((p) => p.seatIndex === 2)?.name || 'North'}</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({stepState?.hands[2]?.length || 0} cards)
          </span>
        </div>
        {/* Face-Up Hand North */}
        <div className="flex items-center -space-x-4 sm:-space-x-6 mt-1 overflow-x-auto max-w-full px-2 py-1">
          {(stepState?.hands[2] || []).map((card) => (
            <PlayingCard key={`p2-${card.id}`} card={card} isFaceUp={true} size="xs" />
          ))}
        </div>
      </div>

      {/* MIDDLE ROW: WEST (SEAT 1) | CENTRAL TABLE | EAST (SEAT 3) */}
      <div className="flex-1 flex items-center justify-between px-2 sm:px-6 my-1 min-h-0 relative">
        {/* WEST PLAYER (SEAT 1) */}
        <div className="flex flex-col items-center shrink-0 z-10 max-w-[120px] sm:max-w-[160px]">
          <div
            className={cn(
              'px-2.5 py-1 rounded-full border flex items-center space-x-1.5 text-xs font-bold mb-1 transition-all',
              stepState?.activeSeat === 1
                ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                : 'bg-slate-900/90 text-slate-300 border-slate-800'
            )}
          >
            <span>{selectedMatch.players.find((p) => p.seatIndex === 1)?.avatar || '🦊'}</span>
            <span className="truncate max-w-[60px]">{selectedMatch.players.find((p) => p.seatIndex === 1)?.name || 'West'}</span>
            <span className="text-[10px] font-mono">({stepState?.hands[1]?.length || 0})</span>
          </div>
          {/* Face-up cards West */}
          <div className="flex flex-wrap gap-1 justify-center max-h-[140px] overflow-y-auto p-1">
            {(stepState?.hands[1] || []).map((card) => (
              <PlayingCard key={`p1-${card.id}`} card={card} isFaceUp={true} size="xs" />
            ))}
          </div>
        </div>

        {/* CENTRAL STAGE TABLE */}
        <div className="flex-1 max-w-md mx-2 h-full flex flex-col items-center justify-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3 shadow-inner relative overflow-hidden">
          {stepState?.currentRound && stepState.currentRound <= 3 ? (
            /* TRICK TABLE (ROUNDS 1-3) */
            <div className="flex flex-col items-center space-y-2 w-full">
              <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center">
                Active Trick Table {stepState.leadSuit ? `• Led: ${stepState.leadSuit}` : ''}
              </p>
              <div className="grid grid-cols-2 gap-3 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
                {selectedMatch.players.map((player) => {
                  const trickCard = stepState.currentTrick.find(
                    (tc) => tc.seatIndex === player.seatIndex
                  );
                  return (
                    <div
                      key={player.id}
                      className="flex flex-col items-center p-1.5 bg-slate-900/80 rounded-lg border border-slate-800 min-w-[70px]"
                    >
                      <span className="text-[10px] font-bold text-slate-400 mb-1">
                        {player.avatar} {player.name.split(' ')[0]}
                      </span>
                      {trickCard ? (
                        <PlayingCard card={trickCard.card} isFaceUp={true} size="xs" />
                      ) : (
                        <div className="w-10 h-15 rounded-lg border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                          WAIT
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* SOLITAIRE RACE MATRIX (ROUND 4) */
            <div className="w-full h-full flex flex-col justify-center items-center">
              <p className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-2">
                Round 4 Solitaire Race Board
              </p>
              <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
                {(['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'] as Suit[]).map((suit) => {
                  const placed = stepState?.solitaireBoard.placed[suit] || [];
                  const isRed = suit === 'HEARTS' || suit === 'DIAMONDS';
                  return (
                    <div
                      key={suit}
                      className="flex flex-col items-center bg-slate-950/80 border border-slate-800 rounded-lg p-1.5"
                    >
                      <span className={cn('text-[10px] font-bold uppercase mb-1', isRed ? 'text-rose-400' : 'text-slate-300')}>
                        {suit.substring(0, 3)}
                      </span>
                      <div className="text-xs font-black text-amber-300 font-mono">
                        {placed.length > 0 ? `${placed.length} cards` : 'Empty'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION DESCRIPTION BANNER */}
          <div className="absolute bottom-2 inset-x-2 px-3 py-1 bg-black/80 backdrop-blur border border-white/10 rounded-lg text-center text-xs font-mono text-red-300 truncate">
            {stepState?.lastActionDescription}
          </div>
        </div>

        {/* EAST PLAYER (SEAT 3) */}
        <div className="flex flex-col items-center shrink-0 z-10 max-w-[120px] sm:max-w-[160px]">
          <div
            className={cn(
              'px-2.5 py-1 rounded-full border flex items-center space-x-1.5 text-xs font-bold mb-1 transition-all',
              stepState?.activeSeat === 3
                ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                : 'bg-slate-900/90 text-slate-300 border-slate-800'
            )}
          >
            <span>{selectedMatch.players.find((p) => p.seatIndex === 3)?.avatar || '🐉'}</span>
            <span className="truncate max-w-[60px]">{selectedMatch.players.find((p) => p.seatIndex === 3)?.name || 'East'}</span>
            <span className="text-[10px] font-mono">({stepState?.hands[3]?.length || 0})</span>
          </div>
          {/* Face-up cards East */}
          <div className="flex flex-wrap gap-1 justify-center max-h-[140px] overflow-y-auto p-1">
            {(stepState?.hands[3] || []).map((card) => (
              <PlayingCard key={`p3-${card.id}`} card={card} isFaceUp={true} size="xs" />
            ))}
          </div>
        </div>
      </div>

      {/* SOUTH PLAYER (SEAT 0 - YOU) */}
      <div className="flex flex-col items-center shrink-0 z-10">
        {/* Face-Up Hand South */}
        <div className="flex items-center -space-x-4 sm:-space-x-6 mb-1 overflow-x-auto max-w-full px-2 py-1">
          {(stepState?.hands[0] || []).map((card) => (
            <PlayingCard key={`p0-${card.id}`} card={card} isFaceUp={true} size="xs" />
          ))}
        </div>
        <div
          className={cn(
            'px-3 py-1 rounded-full border flex items-center space-x-2 text-xs font-bold transition-all',
            stepState?.activeSeat === 0
              ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)]'
              : 'bg-slate-900/90 text-slate-300 border-slate-800'
          )}
        >
          <span>{selectedMatch.players.find((p) => p.seatIndex === 0)?.avatar || '👑'}</span>
          <span>{selectedMatch.players.find((p) => p.seatIndex === 0)?.name || 'You'}</span>
          <span className="text-[10px] opacity-75 font-mono">
            ({stepState?.hands[0]?.length || 0} cards)
          </span>
        </div>
      </div>
    </div>
  );
};
