'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoundNumber } from '@/lib/types';
import { soundEngine } from '@/lib/audio';

interface ReplayControlBarProps {
  currentStep: number;
  totalSteps: number;
  roundSteps: Record<RoundNumber, number> | null;
  currentRound?: RoundNumber;
  isPlaying: boolean;
  playbackSpeed: number;
  onStepChange: (step: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

export const ReplayControlBar: React.FC<ReplayControlBarProps> = ({
  currentStep,
  totalSteps,
  roundSteps,
  currentRound,
  isPlaying,
  playbackSpeed,
  onStepChange,
  onPlayToggle,
  onSpeedChange,
}) => {
  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-col space-y-2 shrink-0">
      {/* SEEK TIMELINE SCRUBBER */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <span className="text-slate-400 w-12 text-right font-bold">
          {currentStep + 1} / {totalSteps || 1}
        </span>
        <input
          type="range"
          min={0}
          max={(totalSteps || 1) - 1}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

      {/* ACTION BUTTONS DOCK */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* ROUND JUMP SHORTCUTS */}
        <div className="flex items-center space-x-1">
          {(
            [
              { r: 1, label: 'R1' },
              { r: 2, label: 'R2' },
              { r: 3, label: 'R3' },
              { r: 4, label: 'R4' },
            ] as const
          ).map(({ r, label }) => {
            const stepIdx = roundSteps?.[r as RoundNumber] ?? 0;
            return (
              <button
                key={r}
                onClick={() => {
                  onStepChange(stepIdx);
                  soundEngine.playClick();
                }}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer',
                  currentRound === r
                    ? 'bg-red-600 text-white font-black'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* PLAY / PAUSE / STEP CONTROLS */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              onStepChange(0);
              soundEngine.playClick();
            }}
            title="Reset to Start"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onStepChange(Math.max(0, currentStep - 1));
              soundEngine.playCardSnap();
            }}
            title="Step Backward"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onPlayToggle}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center space-x-1.5 shadow-lg shadow-red-900/50 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onStepChange(Math.min((totalSteps || 1) - 1, currentStep + 1));
              soundEngine.playCardSnap();
            }}
            title="Step Forward"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* SPEED SELECTOR */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 text-[10px] px-1 font-bold">SPEED:</span>
          {([1, 2, 4] as const).map((spd) => (
            <button
              key={spd}
              onClick={() => {
                onSpeedChange(spd);
                soundEngine.playClick();
              }}
              className={cn(
                'px-2 py-0.5 rounded font-bold transition-colors cursor-pointer',
                playbackSpeed === spd
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
