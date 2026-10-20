'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Crown, PartyPopper } from 'lucide-react';
import { soundEngine } from '@/lib/audio';

interface ConfettiOverlayProps {
  winnerName?: string;
  winnerAvatar?: string;
  winnerScore?: number;
  isMyWin?: boolean;
  showBanner?: boolean;
}

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({
  winnerName,
  winnerAvatar = '🏆',
  winnerScore,
  isMyWin = false,
  showBanner = true,
}) => {
  const hasTriggeredRef = useRef(false);

  const fireGrandConfetti = useCallback(() => {
    soundEngine.playVictoryFanfare();

    // 1. Center burst
    confetti({
      particleCount: 90,
      spread: 110,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'],
      zIndex: 9999,
    });

    // 2. Left side cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.8 },
        colors: ['#fbbf24', '#f43f5e', '#34d399', '#60a5fa'],
        zIndex: 9999,
      });
    }, 250);

    // 3. Right side cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.8 },
        colors: ['#fbbf24', '#f43f5e', '#34d399', '#60a5fa'],
        zIndex: 9999,
      });
    }, 450);

    // 4. Golden stars / confetti shower
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        startVelocity: 45,
        decay: 0.9,
        origin: { y: 0.3 },
        shapes: ['star', 'circle'],
        colors: ['#ffd700', '#f59e0b', '#ffffff'],
        zIndex: 9999,
      });
    }, 700);
  }, []);

  useEffect(() => {
    fireGrandConfetti();

    // Repeat a secondary burst 2.2 seconds in
    const timer = setTimeout(() => {
      fireGrandConfetti();
    }, 2200);

    return () => clearTimeout(timer);
  }, [fireGrandConfetti]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* Golden Radial Pulse in Center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(245,158,11,0.25)_0%,_transparent_70%)] pointer-events-none"
      />

      {/* Floating Animated Celebration Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {['left-10 top-12', 'right-12 top-16', 'left-1/4 bottom-20', 'right-1/4 top-1/3'].map(
          (pos, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{
                y: [-15, 15, -15],
                opacity: [0.4, 0.9, 0.4],
                rotate: [-10, 10, -10],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeInOut',
              }}
              className={`absolute ${pos} text-3xl sm:text-5xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]`}
            >
              {i % 2 === 0 ? '✨' : '👑'}
            </motion.div>
          )
        )}
      </div>

      {/* Winner Banner Header if showBanner is true */}
      {showBanner && winnerName && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="pointer-events-auto absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-gradient-to-r from-amber-950/90 via-black/95 to-amber-950/90 border-2 border-amber-500/80 px-5 py-2.5 rounded-full shadow-[0_0_35px_rgba(245,158,11,0.6)] backdrop-blur-md"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow-inner animate-bounce">
            {winnerAvatar}
          </div>
          <div className="text-left">
            <div className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center space-x-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>FINAL ROUND WINNER!</span>
            </div>
            <div className="text-sm sm:text-base font-black text-white truncate max-w-[180px] sm:max-w-[240px]">
              {winnerName} {isMyWin && '(YOU!) 🎉'}
            </div>
          </div>
          {winnerScore !== undefined && (
            <div className="pl-3 border-l border-white/20 text-right">
              <div className="text-[9px] font-bold text-slate-400 uppercase">Score</div>
              <div className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                {winnerScore} pts
              </div>
            </div>
          )}
          <button
            onClick={fireGrandConfetti}
            className="ml-2 p-1.5 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 rounded-full text-amber-300 transition-all active:scale-95 cursor-pointer"
            title="More Confetti!"
          >
            <PartyPopper className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
