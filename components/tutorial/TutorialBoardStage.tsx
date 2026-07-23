'use client';

import React from 'react';
import { motion } from 'motion/react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { Card } from '@/lib/types';
import { TutorialStepDefinition, TutorialStepState } from '@/lib/tutorial-engine';

interface TutorialBoardStageProps {
  currentStepDef: TutorialStepDefinition;
  stepState: TutorialStepState;
  onCardClick: (card: Card) => void;
  onOpenGuide: () => void;
}

export const TutorialBoardStage: React.FC<TutorialBoardStageProps> = ({
  currentStepDef,
  stepState,
  onCardClick,
  onOpenGuide,
}) => {
  return (
    <div className="relative flex-1 flex flex-col justify-between p-2 sm:p-4 max-w-4xl mx-auto w-full z-20 overflow-hidden">
      {/* NORTH PLAYER (Bot 2) */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-slate-900/90 border border-slate-700 rounded-full shadow text-xs">
          <span className="text-sm">{currentStepDef.players[2].avatar}</span>
          <span className="font-bold text-slate-300 text-[11px]">
            {currentStepDef.players[2].name}
          </span>
        </div>
      </div>

      {/* MIDDLE SECTION: WEST PLAYER, CENTER TRICK MAT, EAST PLAYER */}
      <div className="flex items-center justify-between my-1 w-full">
        {/* WEST PLAYER (Bot 1) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-slate-900/90 border border-slate-700 rounded-full shadow text-xs">
            <span className="text-sm">{currentStepDef.players[1].avatar}</span>
            <span className="font-bold text-slate-300 text-[11px]">
              {currentStepDef.players[1].name}
            </span>
          </div>
        </div>

        {/* CENTER TRICK MAT */}
        <div className="relative w-48 h-36 sm:w-72 sm:h-52 bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-2 flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.15)] overflow-visible">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <span className="text-xl sm:text-3xl font-black text-emerald-400 uppercase tracking-widest">
              ROUND {currentStepDef.roundNumber}
            </span>
          </div>

          <div className="relative w-full h-full flex items-center justify-center">
            {stepState.currentTrick.map((tc) => {
              const seatPosClass = {
                0: 'bottom-1 left-1/2 -translate-x-1/2 z-30',
                1: 'left-1 top-1/2 -translate-y-1/2 z-20',
                2: 'top-1 left-1/2 -translate-x-1/2 z-10',
                3: 'right-1 top-1/2 -translate-y-1/2 z-20',
              }[tc.seatIndex];

              const isQueenOfHearts = tc.card.suit === 'HEARTS' && tc.card.value === 12;

              return (
                <motion.div
                  key={`${tc.playerId}-${tc.card.id}`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`absolute ${seatPosClass}`}
                >
                  <div className="relative">
                    <PlayingCard card={tc.card} size="xs" isFaceUp={true} />
                    {isQueenOfHearts && (
                      <div className="absolute -top-2.5 -right-2 bg-rose-600 text-white text-[8px] font-black px-1 py-0.2 rounded-full border border-rose-300 shadow animate-bounce">
                        +50
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* EAST PLAYER (Bot 3) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1.5 px-2.5 py-0.5 bg-slate-900/90 border border-slate-700 rounded-full shadow text-xs">
            <span className="text-sm">{currentStepDef.players[3].avatar}</span>
            <span className="font-bold text-slate-300 text-[11px]">
              {currentStepDef.players[3].name}
            </span>
          </div>
        </div>
      </div>

      {/* SOUTH PLAYER HAND */}
      <div className="w-full flex flex-col items-center space-y-1 pb-1">
        <div className="flex items-center justify-between w-full px-1 text-[10px]">
          <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>YOUR HAND (ACTION LOCKED)</span>
          </div>
          <button
            onClick={onOpenGuide}
            className="text-amber-400 hover:underline font-mono flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Read Rule</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center space-x-2 sm:space-x-3 p-2 bg-slate-900/90 border-2 border-amber-500/40 rounded-xl shadow-2xl w-full max-w-md">
          {stepState.playerHand.map((card) => {
            const isTarget = card.id === currentStepDef.targetCardId;

            return (
              <div
                key={card.id}
                className="relative group"
                style={{
                  pointerEvents: isTarget ? 'auto' : 'none',
                }}
              >
                {isTarget && stepState.phase === 'PROMPT' && (
                  <>
                    <div className="absolute -inset-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-80 blur-sm animate-pulse z-0" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow uppercase tracking-widest whitespace-nowrap z-40 animate-bounce flex items-center space-x-0.5">
                      <span>PLAY THIS</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </>
                )}

                {!isTarget && stepState.phase === 'PROMPT' && (
                  <div className="absolute inset-0 bg-slate-950/70 rounded-lg z-30 flex items-center justify-center border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">
                      Locked
                    </span>
                  </div>
                )}

                <PlayingCard
                  card={card}
                  size="sm"
                  isFaceUp={true}
                  isPlayable={isTarget}
                  isSelected={isTarget}
                  onClick={() => onCardClick(card)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
