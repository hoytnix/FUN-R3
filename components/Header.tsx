'use client';

import React, { useState, useEffect } from 'react';
import { Settings, HelpCircle, Trophy, Share2, Check, Shield, History, WifiOff } from 'lucide-react';
import { RoomState } from '@/lib/types';

interface HeaderProps {
  room?: RoomState;
  isOffline?: boolean;
  isMultiplayer?: boolean;
  currentView?: string;
  onOpenRules: () => void;
  onOpenScoreboard: () => void;
  onOpenMatchHistory?: () => void;
  onToggleHideHand?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  isOffline = false,
  isMultiplayer = false,
  currentView = 'HUB',
  onOpenRules,
  onOpenScoreboard,
  onOpenMatchHistory,
  onToggleHideHand,
  onOpenSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => setIsNetworkOnline(true);
    const handleOffline = () => setIsNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isGameView = currentView === 'GAME' || currentView === 'SINGLE_PLAYER_GAME';
  const isLobbyView = currentView === 'ONLINE_LOBBY';

  const handleCopyLink = () => {
    if (!room?.roomCode) return;
    const url = `${window.location.origin}?room=${room.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoundLabel = (r?: number) => {
    switch (r) {
      case 1: return 'R1: Hearts ♥';
      case 2: return 'R2: Royal Suite 👑';
      case 3: return 'R3: Queen Sudden Death 💀';
      case 4: return 'R4: Solitaire Race 🏎️';
      default: return 'Lobby ⏳';
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
      {isGameView && room && room.status !== 'LOBBY_WAITING' && (
        <div className="hidden md:flex short:hidden items-center space-x-6">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Round {room.currentRound} of 4
            </p>
            <p className="text-xs font-bold text-red-400 italic uppercase">
              {getRoundLabel(room.currentRound)}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Trump Suit</p>
            <p className="text-xs font-bold text-red-500">HEARTS ❤️</p>
          </div>
        </div>
      )}

      {/* Right Controls & Room Code */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {!isNetworkOnline && (
          <div
            id="offline-indicator-badge"
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-950/90 border border-amber-600/80 rounded-lg text-[10px] sm:text-xs font-mono font-bold text-amber-300 flex items-center space-x-1 shadow-sm"
            title="PWA Offline Mode Active — Single Player vs Bots and Pass & Play work 100% offline!"
          >
            <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" />
            <span className="hidden xs:inline">OFFLINE MODE</span>
          </div>
        )}

        {isGameView && isOffline && onToggleHideHand && (
          <button
            id="hide-hand-header-btn"
            onClick={onToggleHideHand}
            className="px-2 py-1 xs:px-2.5 xs:py-1.5 short:px-1.5 short:py-0.5 bg-red-950/80 hover:bg-red-900 border border-red-800 rounded-lg text-[10px] xs:text-xs font-bold text-red-300 flex items-center space-x-1 shadow-sm active:scale-95 transition-all"
            title="Cover Screen / Hide Hand"
          >
            <Shield className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-red-400" />
            <span className="hidden sm:inline">Hide Hand</span>
          </button>
        )}

        {(isLobbyView || isGameView) && isMultiplayer && room?.roomCode && room.roomCode !== 'LOCAL' && (
          <button
            id="copy-room-code-btn"
            onClick={handleCopyLink}
            className="px-2 py-0.5 sm:px-3 sm:py-1 short:px-1.5 short:py-0.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] sm:text-xs font-mono font-bold text-slate-200 transition-all flex items-center space-x-1 sm:space-x-1.5 shadow-sm active:scale-95"
            title="Click to copy join link"
          >
            <span className="text-slate-400 hidden sm:inline">ROOM:</span>
            <span className="text-red-400 tracking-wider font-mono font-black">{room.roomCode}</span>
            {copied ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" /> : <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />}
          </button>
        )}

        <button
          id="open-settings-btn"
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="Settings (Sound & Haptics)"
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-slate-200" />
        </button>

        {onOpenMatchHistory && (
          <button
            id="open-match-history-btn"
            onClick={onOpenMatchHistory}
            className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Match History & Replays"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-red-400" />
          </button>
        )}

        <button
          id="open-rules-btn"
          onClick={onOpenRules}
          className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
          title="View Rules"
        >
          <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-amber-400" />
        </button>

        {(isGameView || isLobbyView) && room && (
          <button
            id="open-scoreboard-btn"
            onClick={onOpenScoreboard}
            className="p-1.5 sm:p-2 short:p-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 short:w-3 short:h-3 text-amber-400" />
          </button>
        )}
      </div>
    </header>
  );
};
