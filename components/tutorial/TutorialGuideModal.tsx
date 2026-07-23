'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';
import { Suit } from '@/lib/types';
import { TutorialStepDefinition } from '@/lib/tutorial-engine';

interface TutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStepDef: TutorialStepDefinition;
}

export const TutorialGuideModal: React.FC<TutorialGuideModalProps> = ({
  isOpen,
  onClose,
  currentStepDef,
}) => {
  if (!isOpen) return null;

  const renderSuitIcon = (suit: Suit) => {
    switch (suit) {
      case 'HEARTS': return <span className="text-rose-500 font-bold">♥</span>;
      case 'DIAMONDS': return <span className="text-rose-500 font-bold">♦</span>;
      case 'CLUBS': return <span className="text-slate-100 font-bold">♣</span>;
      case 'SPADES': return <span className="text-slate-100 font-bold">♠</span>;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      >
        <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 sm:p-5 max-w-md w-full shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-3 relative max-h-[90dvh] overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-950 border border-amber-800/60">
              {currentStepDef.badge}
            </span>
            <span className="text-xs font-bold text-amber-300">
              {currentStepDef.subtitle}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white">
            {currentStepDef.title}
          </h3>

          {currentStepDef.warningOverlay && (
            <div className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold ${
              currentStepDef.warningOverlay.severity === 'danger'
                ? 'bg-rose-950/90 border-rose-600 text-rose-200'
                : 'bg-amber-950/90 border-amber-600 text-amber-200'
            }`}>
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{currentStepDef.warningOverlay.message}</span>
            </div>
          )}

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-200">
            <p className="leading-relaxed">{currentStepDef.description}</p>
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
              <strong className="text-amber-400">Situation:</strong> {currentStepDef.conceptText}
            </div>
            <div className="p-2 bg-amber-950/40 rounded-lg border border-amber-800/40 text-amber-200 font-mono text-[11px]">
              <strong>RULE:</strong> {currentStepDef.ruleExplanation}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <span>Led Suit: <strong className="text-white uppercase font-black">{currentStepDef.leadSuit} {renderSuitIcon(currentStepDef.leadSuit)}</strong></span>
            <span className="text-amber-400 font-mono font-bold">Goal: Play highlighted card</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Got It! Play Card</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
