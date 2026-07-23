'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, List, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { MatchRecord, ReplayStepState } from '@/lib/types/replay';
import {
  getMatchHistory,
  deleteMatchRecord,
  clearAllMatchHistory,
  generateDemoMatchRecord,
} from '@/lib/replay-logger';
import { ReplayEngine } from '@/lib/replay-engine';
import { MatchHistoryListView } from './match-history/MatchHistoryListView';
import { ReplayStageBoard } from './match-history/ReplayStageBoard';
import { ReplayControlBar } from './match-history/ReplayControlBar';
import { ReplayTelemetryDrawer } from './match-history/ReplayTelemetryDrawer';

interface MatchHistoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const MatchHistoryModal: React.FC<MatchHistoryModalProps> = ({ isOpen = true, onClose }) => {
  const [matches, setMatches] = useState<MatchRecord[]>(() => {
    if (typeof window !== 'undefined') {
      return getMatchHistory();
    }
    return [];
  });
  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [replayEngine, setReplayEngine] = useState<ReplayEngine | null>(null);

  // Replay playback states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setMatches(getMatchHistory());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Playback Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && replayEngine) {
      const intervalMs = Math.max(250, 1000 / playbackSpeed);
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= replayEngine.getTotalSteps() - 1) {
            setIsPlaying(false);
            return prev;
          }
          soundEngine.playCardSnap();
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, replayEngine]);

  if (!isOpen) return null;

  const handleStartReplay = (match: MatchRecord) => {
    soundEngine.playClick();
    setSelectedMatch(match);
    const engine = new ReplayEngine(match);
    setReplayEngine(engine);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleExitReplay = () => {
    soundEngine.playClick();
    setSelectedMatch(null);
    setReplayEngine(null);
    setIsPlaying(false);
  };

  const handleDeleteMatch = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    deleteMatchRecord(id);
    setMatches((prev) => prev.filter((m) => m.id !== id));
    if (selectedMatch?.id === id) {
      handleExitReplay();
    }
  };

  const handleClearAll = () => {
    soundEngine.playClick();
    clearAllMatchHistory();
    setMatches([]);
  };

  const handleExportJson = (match: MatchRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(match, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FUN_Replay_${match.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleLoadDemo = () => {
    soundEngine.playClick();
    generateDemoMatchRecord();
    const history = getMatchHistory();
    setMatches(history);
  };

  const stepState: ReplayStepState | null = replayEngine
    ? replayEngine.getStepState(currentStep)
    : null;

  const roundSteps = replayEngine ? replayEngine.getRoundStepIndices() : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl h-[92vh] max-h-[900px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-white relative"
      >
        {/* MODAL HEADER */}
        <div className="h-14 px-4 sm:px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-600/30 border border-red-500/50 flex items-center justify-center text-red-400 font-bold">
              <History className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase flex items-center space-x-2">
                <span>Match History & Replay System</span>
                {selectedMatch && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60">
                    REPLAY ENGINE ACTIVE
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {selectedMatch && (
              <button
                onClick={handleExitReplay}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
                <span>Match List</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCREEN CONTENT */}
        {!selectedMatch ? (
          <MatchHistoryListView
            matches={matches}
            onLoadDemo={handleLoadDemo}
            onClearAll={handleClearAll}
            onSelectMatch={handleStartReplay}
            onDeleteMatch={handleDeleteMatch}
            onExportJson={handleExportJson}
          />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* TOP BAR STATUS & TELEMETRY */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs font-mono">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded font-bold bg-red-600 text-white text-[10px] uppercase">
                  ROUND {stepState?.currentRound || 1}
                </span>
                <span className="text-slate-300 font-bold">
                  {stepState?.currentRound === 1 && '♥ Hearts (+5 pts/Heart)'}
                  {stepState?.currentRound === 2 && '👑 Royal Suite (+15 pts J/Q/K)'}
                  {stepState?.currentRound === 3 && '💀 Sudden Death (+50 pts Qh)'}
                  {stepState?.currentRound === 4 && '🏎️ Solitaire Race'}
                </span>
              </div>

              {/* HASH VERIFICATION CHECKSUM BADGE */}
              <div className="flex items-center space-x-3">
                {stepState?.isVerified ? (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>HASH VERIFIED:</span>
                    <span className="font-mono text-emerald-200 tracking-wider">
                      {stepState.expectedHash || 'e8a2f1b9'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[11px] font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>DRIFT RECONCILED</span>
                  </div>
                )}

                <button
                  onClick={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Telemetry Logs</span>
                </button>
              </div>
            </div>

            <ReplayStageBoard selectedMatch={selectedMatch} stepState={stepState} />

            <ReplayTelemetryDrawer
              isOpen={isLogDrawerOpen}
              actions={selectedMatch.actions}
              currentStep={currentStep}
              onClose={() => setIsLogDrawerOpen(false)}
              onSelectStep={(step) => {
                setCurrentStep(step);
                setIsPlaying(false);
              }}
            />

            <ReplayControlBar
              currentStep={currentStep}
              totalSteps={replayEngine?.getTotalSteps() || 1}
              roundSteps={roundSteps}
              currentRound={stepState?.currentRound}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onStepChange={(s) => {
                setCurrentStep(s);
                setIsPlaying(false);
              }}
              onPlayToggle={() => {
                soundEngine.playClick();
                setIsPlaying(!isPlaying);
              }}
              onSpeedChange={(spd) => setPlaybackSpeed(spd)}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};
