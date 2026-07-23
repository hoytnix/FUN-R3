'use client';

import React from 'react';
import { Card, Suit, CardValue } from '@/lib/types';
import { cn } from '@/lib/utils';
import { renderSuitIcon, CardPips, CardCenterArt } from './card/CardPipMatrix';

interface PlayingCardProps {
  card?: Card;
  isFaceUp?: boolean;
  isSelected?: boolean;
  isPlayable?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  badgeText?: string;
  badgeColor?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFaceUp = true,
  isSelected = false,
  isPlayable = false,
  isDisabled = false,
  onClick,
  size = 'md',
  className = '',
  badgeText,
  badgeColor = 'bg-rose-500',
}) => {
  // Size dimension mappings for 2:3 aspect ratio
  const sizeClasses = {
    xs: 'w-10 h-15 text-[9px]',
    sm: 'w-14 h-21 text-xs',
    md: 'w-20 h-30 text-sm',
    lg: 'w-24 h-36 text-base',
    xl: 'w-28 h-42 text-lg',
  }[size];

  if (!card || !isFaceUp) {
    // Card Back
    return (
      <div
        id={card ? `card-back-${card.id}` : 'card-back'}
        onClick={isDisabled ? undefined : onClick}
        className={cn(
          'relative rounded-xl border border-slate-700/80 bg-slate-900 shadow-md transition-all duration-200 select-none overflow-hidden cursor-pointer flex items-center justify-center',
          sizeClasses,
          isDisabled && 'opacity-60 cursor-not-allowed',
          className
        )}
        style={{ aspectRatio: '2/3' }}
      >
        {/* Vector Card Back Pattern */}
        <svg viewBox="0 0 200 300" className="w-full h-full rounded-xl">
          <defs>
            <pattern id="cardBackPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#0f172a" />
              <path d="M 0 10 L 10 0 L 20 10 L 10 20 Z" fill="none" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 5 5 L 15 15 M 15 5 L 5 15" stroke="#334155" strokeWidth="0.8" opacity="0.6" />
              <circle cx="10" cy="10" r="1.5" fill="#f59e0b" opacity="0.7" />
            </pattern>
            <linearGradient id="backBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="192" height="292" rx="12" fill="url(#cardBackPattern)" stroke="url(#backBorder)" strokeWidth="3" />
          <rect x="12" y="12" width="176" height="276" rx="8" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
          
          {/* Center Crest */}
          <circle cx="100" cy="150" r="38" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="100" cy="150" r="32" fill="none" stroke="#818cf8" strokeWidth="1" strokeDasharray="3 3" />
          <text x="100" y="145" textAnchor="middle" fill="#f59e0b" fontSize="22" fontWeight="900" fontFamily="sans-serif">
            F.U.N.
          </text>
          <text x="100" y="162" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="700" letterSpacing="1">
            🖕 NEIGHBOR
          </text>
        </svg>

        {badgeText && (
          <span className={cn('absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow', badgeColor)}>
            {badgeText}
          </span>
        )}
      </div>
    );
  }

  const { suit, value } = card;
  const isRed = suit === 'HEARTS' || suit === 'DIAMONDS';
  const isQueenOfHearts = suit === 'HEARTS' && value === 12;

  // Format Rank Text
  const getRankText = (val: CardValue): string => {
    switch (val) {
      case 11: return 'J';
      case 12: return 'Q';
      case 13: return 'K';
      case 14: return 'A';
      default: return val.toString();
    }
  };

  const rankText = getRankText(value);

  // Corner Index configuration for top-left and bottom-right positions
  const indexStyles = {
    xs: {
      topPos: 'top-0.5 left-0.5',
      bottomPos: 'bottom-0.5 right-0.5',
      fontSize: 'text-[9px]',
      iconSize: 'w-2 h-2 mt-0',
    },
    sm: {
      topPos: 'top-0.5 left-0.5 sm:top-1 sm:left-1',
      bottomPos: 'bottom-0.5 right-0.5 sm:bottom-1 sm:right-1',
      fontSize: 'text-[10px] sm:text-[11px]',
      iconSize: 'w-2.5 h-2.5 mt-0.5',
    },
    md: {
      topPos: 'top-1 left-1 sm:top-1.5 sm:left-1.5',
      bottomPos: 'bottom-1 right-1 sm:bottom-1.5 sm:right-1.5',
      fontSize: 'text-xs sm:text-sm',
      iconSize: 'w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5',
    },
    lg: {
      topPos: 'top-1 left-1 sm:top-1.5 sm:left-1.5',
      bottomPos: 'bottom-1 right-1 sm:bottom-1.5 sm:right-1.5',
      fontSize: 'text-sm sm:text-base',
      iconSize: 'w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5',
    },
    xl: {
      topPos: 'top-1.5 left-1.5 sm:top-2 sm:left-2',
      bottomPos: 'bottom-1.5 right-1.5 sm:bottom-2 sm:right-2',
      fontSize: 'text-base sm:text-lg',
      iconSize: 'w-4 h-4 sm:w-5 sm:h-5 mt-0.5',
    },
  }[size];

  return (
    <div
      id={`card-${card.id}`}
      onClick={isDisabled ? undefined : onClick}
      className={cn(
        'relative rounded-xl bg-white text-slate-900 border transition-all duration-200 select-none shadow-md overflow-hidden flex items-center justify-center',
        sizeClasses,
        'border-slate-300',
        isQueenOfHearts && 'ring-2 ring-rose-500 shadow-rose-200',
        isSelected && 'ring-4 ring-amber-400 -translate-y-3 shadow-xl z-20',
        isPlayable && !isSelected && 'hover:-translate-y-1.5 cursor-pointer hover:shadow-lg ring-2 ring-emerald-400/80',
        isDisabled && 'opacity-50 grayscale-[40%] cursor-not-allowed',
        className
      )}
      style={{ aspectRatio: '2/3' }}
    >
      {/* Top Left Corner Index */}
      <div className={cn('absolute z-20 flex flex-col items-center leading-none select-none pointer-events-none', indexStyles.topPos)}>
        <span className={cn('font-black tracking-tighter leading-none', indexStyles.fontSize, isRed ? 'text-rose-600' : 'text-slate-900')}>
          {rankText}
        </span>
        {renderSuitIcon(suit, indexStyles.iconSize)}
      </div>

      {/* Center Art / Pips */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <CardPips suit={suit} value={value} />
        <CardCenterArt suit={suit} value={value} size={size} />
      </div>

      {/* Bottom Right Corner Index (Inverted) */}
      <div className={cn('absolute z-20 flex flex-col items-center leading-none select-none pointer-events-none transform rotate-180', indexStyles.bottomPos)}>
        <span className={cn('font-black tracking-tighter leading-none', indexStyles.fontSize, isRed ? 'text-rose-600' : 'text-slate-900')}>
          {rankText}
        </span>
        {renderSuitIcon(suit, indexStyles.iconSize)}
      </div>

      {/* Badge Overlay */}
      {badgeText && (
        <span className={cn('absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow z-30', badgeColor)}>
          {badgeText}
        </span>
      )}
    </div>
  );
};
