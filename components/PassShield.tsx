'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, ShieldAlert, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Player } from '@/lib/types';

interface PassShieldProps {
  isOpen: boolean;
  nextPlayer: Player;
  currentRound: number;
  lastActionMessage?: string;
  onReveal: () => void;
}

export const PassShield: React.FC<PassShieldProps> = ({
  isOpen,
  nextPlayer,
  currentRound,
  lastActionMessage,
  onReveal,
}) => {
  const [holding, setHolding] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#050705] bg-[radial-gradient(circle_at_50%_50%,_#1a0505_0%,_#050705_90%)] text-white flex flex-col items-center justify-between p-6 select-none"
      >
        {/* Background Dot Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Top Header Badge */}
        <div className="z-10 flex flex-col items-center space-y-2 mt-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-red-950/80 border border-red-800/80 rounded-full text-xs font-black text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)] uppercase tracking-widest">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>Pass &amp; Play Privacy Shield</span>
          </div>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest">
            Round {currentRound} of 4 • Local Match
          </p>
        </div>

        {/* Center Main Card */}
        <div className="z-10 w-full max-w-sm bg-black/80 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6">
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 p-1 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-5xl">
                {nextPlayer.avatar}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full shadow border border-black">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              PASS PHONE / DEVICE TO
            </p>
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              {nextPlayer.name}
            </h2>
            <p className="text-xs text-red-400 font-semibold italic">
              Keep hand hidden from other players!
            </p>
          </div>

          {/* Last Action Pill */}
          {lastActionMessage && (
            <div className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 font-mono text-center truncate">
              {lastActionMessage}
            </div>
          )}

          {/* Reveal Button */}
          <button
            id="reveal-hand-btn"
            onClick={onReveal}
            onMouseDown={() => setHolding(true)}
            onMouseUp={() => setHolding(false)}
            onTouchStart={() => setHolding(true)}
            onTouchEnd={() => setHolding(false)}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black text-base rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.5)] transition-all active:scale-95 flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
          >
            <Eye className="w-5 h-5" />
            <span>Tap To Reveal Hand</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Guidance */}
        <div className="z-10 text-center text-[10px] text-slate-500 font-mono uppercase tracking-widest space-y-1 mb-2">
          <div className="flex items-center justify-center space-x-1 text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Ur Neighbor (F.U.N.) Single-Device Pass &amp; Play</span>
          </div>
          <p>Tap the top corner &quot;Hide Hand&quot; icon anytime to re-cover</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
