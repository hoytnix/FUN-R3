'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReplayActionLog } from '@/lib/types/replay';

interface ReplayTelemetryDrawerProps {
  isOpen: boolean;
  actions: ReplayActionLog[];
  currentStep: number;
  onClose: () => void;
  onSelectStep: (step: number) => void;
}

export const ReplayTelemetryDrawer: React.FC<ReplayTelemetryDrawerProps> = ({
  isOpen,
  actions,
  currentStep,
  onClose,
  onSelectStep,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 bottom-0 w-80 bg-slate-950/95 border-l border-slate-800 backdrop-blur-md z-30 p-4 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Action Log & Hashes</span>
            </h4>
            <button
              onClick={onClose}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 my-2 pr-1 font-mono text-[11px]">
            {actions.map((act) => {
              const isCurrent = act.stepIndex === currentStep;
              return (
                <div
                  key={act.stepIndex}
                  onClick={() => onSelectStep(act.stepIndex)}
                  className={cn(
                    'p-2 rounded-lg border transition-all cursor-pointer flex flex-col space-y-1',
                    isCurrent
                      ? 'bg-red-950/80 border-red-500 text-white shadow'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      #{act.stepIndex} R{act.roundNumber} [{act.actionType}]
                    </span>
                    <span className="text-[9px] px-1 bg-slate-800 text-emerald-400 rounded">
                      #{act.stateHash.substring(0, 6)}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[10px] truncate">
                    {act.metadata?.description || `Seat ${act.activeSeat} action`}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
