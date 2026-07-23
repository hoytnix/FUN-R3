'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  TutorialEngineState,
  TUTORIAL_STEP_DEFINITIONS,
  TutorialAction,
} from '@/lib/tutorial-engine';
import { Card } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { TutorialGuideModal } from './TutorialGuideModal';
import { TutorialBoardStage } from './TutorialBoardStage';

interface OnboardingSandboxProps {
  engineState: TutorialEngineState;
  dispatch: React.Dispatch<TutorialAction>;
  onClose: () => void;
}

export const OnboardingSandbox: React.FC<OnboardingSandboxProps> = ({
  engineState,
  dispatch,
  onClose,
}) => {
  const currentStepDef = TUTORIAL_STEP_DEFINITIONS[engineState.activeStepIndex];
  const { stepState } = engineState;

  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(true);
  const [lastStepIndex, setLastStepIndex] = useState<number>(engineState.activeStepIndex);

  if (lastStepIndex !== engineState.activeStepIndex) {
    setLastStepIndex(engineState.activeStepIndex);
    setIsGuideModalOpen(true);
  }

  useEffect(() => {
    if (stepState.phase === 'STEP_COMPLETED') {
      soundEngine.playTrickSweep();
    }
  }, [stepState.phase]);

  if (!engineState.isOpen || !currentStepDef) {
    return null;
  }

  const handleCardClick = (card: Card) => {
    if (stepState.phase !== 'PROMPT') return;

    if (card.id === currentStepDef.targetCardId) {
      soundEngine.playCardSnap();
      dispatch({ type: 'PLAY_CARD', cardId: card.id });
    } else {
      soundEngine.playClick();
      dispatch({ type: 'PLAY_CARD', cardId: card.id });
    }
  };

  const handleReset = () => {
    soundEngine.playClick();
    dispatch({ type: 'RESET_STEP' });
    setIsGuideModalOpen(true);
  };

  const handleTriggerAnomaly = () => {
    soundEngine.playClick();
    dispatch({ type: 'TRIGGER_ANOMALY' });
  };

  const handleNextStep = () => {
    soundEngine.playClick();
    if (engineState.activeStepIndex >= TUTORIAL_STEP_DEFINITIONS.length - 1) {
      dispatch({ type: 'COMPLETE_TUTORIAL' });
      onClose();
    } else {
      dispatch({ type: 'NEXT_STEP' });
    }
  };

  const handlePrevStep = () => {
    soundEngine.playClick();
    dispatch({ type: 'PREV_STEP' });
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050705]/95 backdrop-blur-md text-white select-none overflow-hidden h-dvh">
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
        <defs>
          <radialGradient id="spotlightGrad" cx="50%" cy="70%" r="45%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#050705" stopOpacity="0.95" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#spotlightGrad)" />
      </svg>

      <header className="relative z-30 px-3 py-2 bg-black/90 border-b border-slate-800 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs">
            🖕
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[9px] font-mono font-black text-amber-400 uppercase tracking-widest px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800/60">
                {currentStepDef.badge}
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
                {currentStepDef.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsGuideModalOpen(true);
            }}
            className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm animate-pulse"
            title="Read Step Instructions & Rules"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-mono">Guide</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 transition-all cursor-pointer"
            title="Reset active step to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Exit Tutorial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {stepState.lastError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 left-2 right-2 z-40 max-w-md mx-auto bg-rose-950/95 border-2 border-rose-600 rounded-xl p-2.5 text-xs text-rose-200 flex items-center space-x-2 shadow-2xl backdrop-blur"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="font-semibold text-[11px] leading-tight">{stepState.lastError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <TutorialGuideModal
        isOpen={isGuideModalOpen && stepState.phase === 'PROMPT'}
        onClose={() => setIsGuideModalOpen(false)}
        currentStepDef={currentStepDef}
      />

      <TutorialBoardStage
        currentStepDef={currentStepDef}
        stepState={stepState}
        onCardClick={handleCardClick}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      <AnimatePresence>
        {stepState.phase === 'STEP_COMPLETED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          >
            <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-5 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  Step {currentStepDef.id} Complete!
                </span>
                <h3 className="text-lg font-black text-white">
                  {currentStepDef.title}
                </h3>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 text-left leading-relaxed">
                {currentStepDef.successMessage}
              </p>

              <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs text-emerald-300">
                <span>Winner: <strong>{currentStepDef.players.find(p => p.seatIndex === currentStepDef.trickWinnerSeat)?.name}</strong></span>
                <span>Penalty: <strong className="text-amber-400 font-mono">+{currentStepDef.pointsExchanged} pts</strong></span>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer uppercase flex items-center justify-center space-x-1"
                >
                  <span>{engineState.activeStepIndex >= TUTORIAL_STEP_DEFINITIONS.length - 1 ? 'Finish Tutorial' : 'Next Step'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="relative z-30 px-3 py-1.5 bg-black border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevStep}
            disabled={engineState.activeStepIndex === 0}
            className="flex items-center space-x-0.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <span>
            {engineState.activeStepIndex + 1}/{TUTORIAL_STEP_DEFINITIONS.length}
          </span>
          <button
            onClick={handleNextStep}
            className="flex items-center space-x-0.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerAnomaly}
            className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
            title="Simulate state anomaly to test auto-recovery fallback"
          >
            [Test Recovery]
          </button>
        </div>
      </footer>
    </div>
  );
};
