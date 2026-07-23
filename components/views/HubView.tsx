'use client';

import React from 'react';
import { Users, Bot, Smartphone, Download, Sparkles, History } from 'lucide-react';
import { RoomState } from '@/lib/types';
import { OfflineGameState } from '@/lib/offline-engine';
import { HubModeCard } from '@/components/views/HubModeCard';

export type AppView =
  | 'HUB'
  | 'SINGLE_PLAYER_SETUP'
  | 'SINGLE_PLAYER_GAME'
  | 'OFFLINE_SETUP'
  | 'ONLINE_LOBBY'
  | 'GAME';
export type GameMode = 'ONLINE' | 'SINGLE_PLAYER' | 'OFFLINE';

interface HubViewProps {
  pwaPrompt: any;
  isPwaInstalled: boolean;
  onInstallPwa: () => void;
  offlineState: OfflineGameState | null;
  onResumeLocalMatch: () => void;
  onClearLocalSession: () => void;
  room: RoomState | null;
  onSelectMode: (mode: GameMode, view: AppView) => void;
  onLeaveOnlineRoom: () => void;
  onOpenTutorial?: () => void;
  onOpenMatchHistory?: () => void;
}

export const HubView: React.FC<HubViewProps> = ({
  pwaPrompt,
  isPwaInstalled,
  onInstallPwa,
  offlineState,
  onResumeLocalMatch,
  onClearLocalSession,
  room,
  onSelectMode,
  onLeaveOnlineRoom,
  onOpenTutorial,
  onOpenMatchHistory,
}) => {
  const [isOffline, setIsOffline] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 max-w-md mx-auto select-none space-y-6">
      {isOffline && (
        <div className="w-full bg-amber-950/70 border border-amber-600/80 rounded-2xl p-3.5 shadow-lg flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 font-bold">
            ⚡
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-amber-300 uppercase">PWA Offline Mode</p>
            <p className="text-[11px] text-amber-200/80">
              Playing offline. Single Player vs Bots and Pass &amp; Play are 100% ready!
            </p>
          </div>
        </div>
      )}

      {pwaPrompt && !isPwaInstalled && (
        <div className="w-full bg-red-950/60 border border-red-800/80 rounded-2xl p-3.5 shadow-lg flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-red-400 animate-pulse" />
            <div className="text-left">
              <p className="text-xs font-bold text-white uppercase">Install App</p>
              <p className="text-[10px] text-slate-300">Fast home screen access</p>
            </div>
          </div>
          <button
            id="pwa-install-btn"
            onClick={onInstallPwa}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow transition-all uppercase cursor-pointer"
          >
            Install
          </button>
        </div>
      )}

      {/* Resume Session Cards */}
      <div className="w-full space-y-3">
        {offlineState && offlineState.status !== 'GAME_OVER' && (
          <div className="w-full bg-black/60 border border-green-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">
                Active Local Match
              </span>
              <h3 className="text-sm font-bold text-white">
                Round {offlineState.currentRound} of 4 • Local Pass &amp; Play
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="resume-local-btn"
                onClick={onResumeLocalMatch}
                className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] uppercase cursor-pointer"
              >
                Resume
              </button>
              <button
                id="clear-local-btn"
                onClick={onClearLocalSession}
                className="px-2 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-xl border border-white/10 cursor-pointer"
                title="Clear session"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {room && (
          <div className="w-full bg-black/60 border border-red-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">
                Active Online Room
              </span>
              <h3 className="text-sm font-bold text-white">
                Code: <span className="text-amber-400 font-mono font-black">{room.roomCode}</span> ({room.players.length}/4)
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="resume-online-btn"
                onClick={() => onSelectMode('ONLINE', 'GAME')}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] uppercase cursor-pointer"
              >
                Enter Room
              </button>
              <button
                id="leave-online-room-btn"
                onClick={onLeaveOnlineRoom}
                className="px-2 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-xs rounded-xl border border-white/10 cursor-pointer"
                title="Leave Room"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Trigger Cards */}
      <div className="w-full space-y-3">
        {/* 1. Online Multiplayer Mode */}
        <HubModeCard
          id="select-online-mode-btn"
          onClick={() => onSelectMode('ONLINE', 'ONLINE_LOBBY')}
          borderColorClass="border-red-500/30"
          hoverBorderColorClass="hover:border-red-500"
          iconBgClass="bg-red-950/80"
          iconBorderClass="border-red-800/80"
          iconColorClass="text-red-400"
          titleHoverColorClass="group-hover:text-red-400"
          badgeBgClass="bg-red-950/80"
          badgeTextColorClass="text-red-300"
          badgeBorderClass="border-red-800/60"
          icon={<Users className="w-6 h-6" />}
          titleNumber="1"
          titleText="Online Multiplayer"
          badgeLabel="PVP"
          description="Real-time lobby via Firebase. Requires exactly 4 real human players with room code."
        />

        {/* 2. Single Player Mode vs AI */}
        <HubModeCard
          id="select-single-player-mode-btn"
          onClick={() => onSelectMode('SINGLE_PLAYER', 'SINGLE_PLAYER_SETUP')}
          borderColorClass="border-purple-500/30"
          hoverBorderColorClass="hover:border-purple-500"
          iconBgClass="bg-purple-950/80"
          iconBorderClass="border-purple-800/80"
          iconColorClass="text-purple-400"
          titleHoverColorClass="group-hover:text-purple-400"
          badgeBgClass="bg-purple-950/80"
          badgeTextColorClass="text-purple-300"
          badgeBorderClass="border-purple-800/60"
          icon={<Bot className="w-6 h-6" />}
          titleNumber="2"
          titleText="Single Player"
          badgeLabel="BOTS"
          description="Instant offline match with 3 automated AI bots. Choose Easy, Medium, or Hard."
        />

        {/* 3. Pass & Play Offline Mode */}
        <HubModeCard
          id="select-pass-play-mode-btn"
          onClick={() => onSelectMode('OFFLINE', 'OFFLINE_SETUP')}
          borderColorClass="border-green-500/30"
          hoverBorderColorClass="hover:border-green-500"
          iconBgClass="bg-green-950/80"
          iconBorderClass="border-green-800/80"
          iconColorClass="text-green-400"
          titleHoverColorClass="group-hover:text-green-400"
          badgeBgClass="bg-green-950/80"
          badgeTextColorClass="text-green-300"
          badgeBorderClass="border-green-800/60"
          icon={<Smartphone className="w-6 h-6" />}
          titleNumber="3"
          titleText="Pass & Play"
          badgeLabel="1 DEVICE"
          description="Turn-passing on 1 shared device using PassShield privacy hand overlays."
        />

        {/* Guided Interactive Tutorial Launcher */}
        {onOpenTutorial && (
          <button
            id="launch-interactive-tutorial-btn"
            onClick={onOpenTutorial}
            className="relative overflow-visible w-full bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-amber-950/80 hover:from-amber-900/90 hover:to-amber-900/90 border-2 border-amber-500/60 hover:border-amber-400 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Guided Interactive Tutorial
                </h3>
                <p className="text-[11px] text-slate-300">
                  Action-locked 4-step walkthrough of F.U.N. trick rules
                </p>
              </div>
            </div>
          </button>
        )}

        {/* Match History & Replay Launcher */}
        {onOpenMatchHistory && (
          <button
            id="launch-match-history-btn"
            onClick={onOpenMatchHistory}
            className="relative overflow-visible w-full bg-gradient-to-r from-red-950/80 via-slate-900 to-red-950/80 hover:from-red-900/90 hover:to-red-900/90 border-2 border-red-500/60 hover:border-red-400 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(220,38,38,0.25)] flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/50 flex items-center justify-center text-red-400 shrink-0 group-hover:scale-110 transition-transform">
                <History className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white group-hover:text-red-300 transition-colors">
                  Match History & Replays
                </h3>
                <p className="text-[11px] text-slate-300">
                  Hash-verified event-sourced replay player with all 4 hands face-up
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Quick Badges */}
      <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>4 PLAYERS</span>
        </div>
        <span>•</span>
        <span>4 Rounds</span>
        <span>•</span>
        <span>It&apos;s F.U.N.!</span>
      </div>
    </div>
  );
};
