'use client';

import React from 'react';
import { Suit, CardValue } from '@/lib/types';
import { cn } from '@/lib/utils';

export const renderSuitIcon = (s: Suit, className: string = 'w-4 h-4') => {
  switch (s) {
    case 'HEARTS':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className, 'text-rose-600')}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'DIAMONDS':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className, 'text-red-500')}>
          <path d="M12 2L2 12l10 10 10-10L12 2z" />
        </svg>
      );
    case 'CLUBS':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className, 'text-slate-800 dark:text-slate-900')}>
          <path d="M12 2a3.5 3.5 0 00-3.5 3.5c0 .64.18 1.24.49 1.76a4 4 0 10-4.32 5.92A4 4 0 008.5 17.5V19h-2a1 1 0 000 2h11a1 1 0 000-2h-2v-1.5a4 4 0 003.83-4.32 4 4 0 00-4.32-5.92c.31-.52.49-1.12.49-1.76A3.5 3.5 0 0012 2z" />
        </svg>
      );
    case 'SPADES':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={cn(className, 'text-slate-800 dark:text-slate-900')}>
          <path d="M12 2S5 9 5 13.5A4.5 4.5 0 009.5 18H11v2H9a1 1 0 000 2h6a1 1 0 000-2h-2v-2h1.5a4.5 4.5 0 004.5-4.5C19 9 12 2 12 2z" />
        </svg>
      );
  }
};

interface CardPipsProps {
  suit: Suit;
  value: CardValue;
}

export const CardPips: React.FC<CardPipsProps> = ({ suit, value }) => {
  if (value > 10 || value < 2) return null;
  const pips: Array<{ x: number; y: number; invert?: boolean }> = [];

  if (value === 2) {
    pips.push({ x: 50, y: 25 }, { x: 50, y: 75, invert: true });
  } else if (value === 3) {
    pips.push({ x: 50, y: 25 }, { x: 50, y: 50 }, { x: 50, y: 75, invert: true });
  } else if (value === 4) {
    pips.push({ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 30, y: 75, invert: true }, { x: 70, y: 75, invert: true });
  } else if (value === 5) {
    pips.push({ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 50, y: 50 }, { x: 30, y: 75, invert: true }, { x: 70, y: 75, invert: true });
  } else if (value === 6) {
    pips.push({ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 75, invert: true }, { x: 70, y: 75, invert: true });
  } else if (value === 7) {
    pips.push({ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 50, y: 37.5 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 75, invert: true }, { x: 70, y: 75, invert: true });
  } else if (value === 8) {
    pips.push({ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 50, y: 37.5 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 50, y: 62.5, invert: true }, { x: 30, y: 75, invert: true }, { x: 70, y: 75, invert: true });
  } else if (value === 9) {
    pips.push({ x: 30, y: 22 }, { x: 70, y: 22 }, { x: 30, y: 40 }, { x: 70, y: 40 }, { x: 50, y: 50 }, { x: 30, y: 60, invert: true }, { x: 70, y: 60, invert: true }, { x: 30, y: 78, invert: true }, { x: 70, y: 78, invert: true });
  } else if (value === 10) {
    pips.push({ x: 30, y: 20 }, { x: 70, y: 20 }, { x: 50, y: 32 }, { x: 30, y: 44 }, { x: 70, y: 44 }, { x: 30, y: 56, invert: true }, { x: 70, y: 56, invert: true }, { x: 50, y: 68, invert: true }, { x: 30, y: 80, invert: true }, { x: 70, y: 80, invert: true });
  }

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-x-3 inset-y-6 w-[70%] h-[60%] mx-auto my-auto pointer-events-none">
      {pips.map((p, idx) => (
        <g key={idx} transform={`translate(${p.x}, ${p.y}) ${p.invert ? 'rotate(180)' : ''}`}>
          {suit === 'HEARTS' && <path d="M0 6 L-3.5 2.5 C-5 0 -2 -2 0 1 C2 -2 5 0 3.5 2.5 Z" fill="#e11d48" transform="scale(1.8)" />}
          {suit === 'DIAMONDS' && <path d="M0 -5 L4 0 L0 5 L-4 0 Z" fill="#ea580c" transform="scale(1.6)" />}
          {suit === 'CLUBS' && <path d="M0 -4 A2 2 0 0 1 2 -2 A2 2 0 0 1 0 0 A2 2 0 0 1 -2 -2 A2 2 0 0 1 0 -4 M-1 0 L1 0 L1 4 L-1 4 Z" fill="#1e293b" transform="scale(1.5)" />}
          {suit === 'SPADES' && <path d="M0 -5 C-3 0 -5 2 -5 4 C-5 6 -3 7 0 4 C3 7 5 6 5 4 C5 2 3 0 0 -5 M-1 3 L1 3 L1 6 L-1 6 Z" fill="#0f172a" transform="scale(1.5)" />}
        </g>
      ))}
    </svg>
  );
};

interface CardCenterArtProps {
  suit: Suit;
  value: CardValue;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const CardCenterArt: React.FC<CardCenterArtProps> = ({ suit, value, size }) => {
  const isRed = suit === 'HEARTS' || suit === 'DIAMONDS';
  const isTrump = suit === 'HEARTS';
  const isQueenOfHearts = suit === 'HEARTS' && value === 12;

  if (value === 14) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={cn('p-3 rounded-full', isTrump && 'bg-rose-50 border border-rose-300 shadow-inner')}>
          {renderSuitIcon(suit, size === 'xl' || size === 'lg' ? 'w-12 h-12' : 'w-8 h-8')}
        </div>
      </div>
    );
  }

  if (value >= 11 && value <= 13) {
    return (
      <div className="absolute inset-x-2.5 inset-y-4 rounded-md border border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100/90 flex items-center justify-center p-0.5 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 100 120" className="w-10 h-14 sm:w-12 sm:h-16 my-auto">
          <defs>
            <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          <rect x="15" y="10" width="70" height="100" rx="8" fill={isQueenOfHearts ? '#fff1f2' : '#f8fafc'} stroke={isQueenOfHearts ? '#f43f5e' : '#cbd5e1'} strokeWidth="2" />

          {isQueenOfHearts && (
            <circle cx="50" cy="50" r="32" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          )}

          <path d="M30 90 C30 65 70 65 70 90 Z" fill={isRed ? '#e11d48' : '#334155'} opacity="0.85" />
          <circle cx="50" cy="45" r="14" fill="#fed7aa" stroke="#7c2d12" strokeWidth="1.5" />

          {value === 13 && (
            <path d="M34 36 L40 22 L50 32 L60 22 L66 36 Z" fill="url(#goldCrown)" stroke="#78350f" strokeWidth="1.5" />
          )}
          {value === 12 && (
            <path d="M36 36 L42 25 L50 30 L58 25 L64 36 Z" fill={isQueenOfHearts ? '#f43f5e' : 'url(#goldCrown)'} stroke="#881337" strokeWidth="1.5" />
          )}
          {value === 11 && (
            <path d="M38 36 L50 26 L62 36 Z" fill="#3b82f6" stroke="#1e3a8a" strokeWidth="1.5" />
          )}

          <circle cx="50" cy="72" r="8" fill="#ffffff" stroke={isRed ? '#e11d48' : '#0f172a'} strokeWidth="1.5" />
          <text x="50" y="75" textAnchor="middle" fontSize="9" fontWeight="bold" fill={isRed ? '#e11d48' : '#0f172a'}>
            {suit === 'HEARTS' ? '♥' : suit === 'DIAMONDS' ? '♦' : suit === 'CLUBS' ? '♣' : '♠'}
          </text>
        </svg>
      </div>
    );
  }

  return null;
};
