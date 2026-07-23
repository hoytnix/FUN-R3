import React from 'react';
import { cn } from '@/lib/utils';

interface HubModeCardProps {
  id: string;
  onClick: () => void;
  borderColorClass: string;
  hoverBorderColorClass: string;
  iconBgClass: string;
  iconBorderClass: string;
  iconColorClass: string;
  titleHoverColorClass: string;
  badgeBgClass: string;
  badgeTextColorClass: string;
  badgeBorderClass: string;
  icon: React.ReactNode;
  titleNumber: string;
  titleText: string;
  badgeLabel: string;
  description: string;
}

export const HubModeCard: React.FC<HubModeCardProps> = ({
  id,
  onClick,
  borderColorClass,
  hoverBorderColorClass,
  iconBgClass,
  iconBorderClass,
  iconColorClass,
  titleHoverColorClass,
  badgeBgClass,
  badgeTextColorClass,
  badgeBorderClass,
  icon,
  titleNumber,
  titleText,
  badgeLabel,
  description,
}) => {
  return (
    <button
      id={id}
      onClick={onClick}
      className={cn(
        'relative overflow-visible w-full bg-black/60 border rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center space-x-4 transition-all active:scale-95 text-left group cursor-pointer',
        borderColorClass,
        hoverBorderColorClass
      )}
    >
      {/* Top-Right Badge (Center placed at top-right pixel of the card) */}
      <span
        className={cn(
          'absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 z-20 px-2.5 py-0.5 text-[9px] font-extrabold border rounded-full uppercase shadow-lg pointer-events-none whitespace-nowrap',
          badgeBgClass,
          badgeTextColorClass,
          badgeBorderClass
        )}
      >
        {badgeLabel}
      </span>

      <div
        className={cn(
          'w-12 h-12 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform shrink-0',
          iconBgClass,
          iconBorderClass,
          iconColorClass
        )}
      >
        {icon}
      </div>
      <div className="flex-1 pr-2">
        <h2
          className={cn(
            'text-base font-black text-white uppercase tracking-wide transition-colors',
            titleHoverColorClass
          )}
        >
          {titleNumber}. {titleText}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </button>
  );
};
