'use client';

import React from 'react';
import { Settings, HelpCircle, Trophy, Shield, History } from 'lucide-react';

interface HeaderProps {
  currentRound?: number;
  isOffline?: boolean;
  currentView?: string;
  onOpenRules: () => void;
  onOpenScoreboard: () => void;
  onOpenMatchHistory?: () => void;
  onToggleHideHand?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRound,
  isOffline = false,
  currentView = 'HUB',
  onOpenRules,
  onOpenScoreboard,
  onOpenMatchHistory,
  onToggleHideHand,
  onOpenSettings,
}) => {
  const isGameView = currentView === 'GAME' || currentView === 'SINGLE_PLAYER_GAME';

  const getRoundLabel = (r?: number) => {
    switch (r) {
      case 1: return 'R1: Hearts ♥';
      case 2: return 'R2: Royal Suite 👑';
      case 3: return 'R3: Queen Sudden Death 💀';
      case 4: return 'R4: Solitaire Race 🏎️';
      default: return 'Match In Progress ⏳';
    }
  };

  return (
    <header className="h-11 xs:h-13 sm:h-16 md:h-20 short:h-9 px-2 xs:px-3 sm:px-8 short:px-2 flex items-center justify-between bg-black/60 border-b border-white/10 backdrop-blur-md z-50 select-none shrink-0">
      {/* Brand Title */}
      <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
        <div className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 short:w-6 short:h-6 bg-red-600 rounded-lg xs:rounded-xl flex items-center justify-center font-bold text-sm xs:text-lg sm:text-2xl short:text-xs shadow-[0_0_15px_rgba(220,38,38,0.4)] text-white shrink-0">
          🖕
        </div>
        <div>
          <h1 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl short:text-base font-black tracking-tighter leading-none text-white uppercase">
            UR NEIGHBOR
          </h1>
        </div>
      </div>

      {/* Center Round & Trump Info */}
      {isGameView && currentRound && (
        <div className="hidden md:flex short:hidden items-center space-x-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Round {currentRound} of 4
            </p>
            <p className="text-xs font-bold text-red-400 italic uppercase">
              {getRoundLabel(currentRound)}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Trump Suit</p>
            <p className="text-xs font-bold text-red-500">HEARTS ❤️</p>
          </div>
        </div>
      )}

      {/* Right Controls & Offline Mode Badge */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        <div
          id="offline-indicator-badge"
          className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-emerald-950/80 border border-emerald-600/60 rounded-lg text-[10px] sm:text-xs font-mono font-bold text-emerald-300 flex items-center space-x-1 shadow-sm"
          title="Standalone Client-Side Mode — 100% Local State"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="hidden xs:inline">LOCAL</span>
        </div>

        {isGameView && isOffline && onToggleHideHand && (
          <button
            id="hide-hand-header-btn"
            onClick={onToggleHideHand}
            className="px-2 py-1 xs:px-2.5 xs:py-1.5 short:px-1.5 short:py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-800 rounded-lg text-[10px] xs:text-xs font-bold text-red-300 flex items-center space-x-1 shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Cover Screen / Hide Hand"
          >
            <Shield className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-red-400" />
            <span className="hidden sm:inline">Hide Hand</span>
          </button>
        )}

        {onOpenSettings && (
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Settings (Sound & Haptics)"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-slate-200" />
          </button>
        )}

        {onOpenMatchHistory && (
          <button
            id="open-match-history-btn"
            onClick={onOpenMatchHistory}
            className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Match History & Replays"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-red-400" />
          </button>
        )}

        <button
          id="open-rules-btn"
          onClick={onOpenRules}
          className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="View Rules"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-amber-400" />
        </button>

        {isGameView && (
          <button
            id="open-scoreboard-btn"
            onClick={onOpenScoreboard}
            className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-amber-400" />
          </button>
        )}
      </div>
    </header>
  );
};
