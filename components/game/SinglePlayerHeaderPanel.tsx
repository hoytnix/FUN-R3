import React from 'react';
import { ArrowLeft, Sparkles, Bot } from 'lucide-react';
import { BotDifficulty } from '@/lib/bot-engine';

interface SinglePlayerHeaderPanelProps {
  difficulty: BotDifficulty;
  onExitToMenu: () => void;
  onOpenRules?: () => void;
  onOpenScoreboard?: () => void;
}

export const SinglePlayerHeaderPanel: React.FC<SinglePlayerHeaderPanelProps> = ({
  difficulty,
  onExitToMenu,
  onOpenRules,
  onOpenScoreboard,
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-black/80 border-b border-white/10 text-xs font-bold text-white z-20">
      <div className="flex items-center space-x-2">
        <button
          id="sp-exit-menu-btn"
          onClick={onExitToMenu}
          className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

        <div className="flex items-center space-x-1 px-2.5 py-1 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400 font-mono">
          <Bot className="w-3.5 h-3.5" />
          <span className="uppercase">VS BOTS ({difficulty})</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {onOpenRules && (
          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all cursor-pointer"
          >
            Rules
          </button>
        )}
        {onOpenScoreboard && (
          <button
            onClick={onOpenScoreboard}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow transition-all cursor-pointer"
          >
            Scores
          </button>
        )}
      </div>
    </div>
  );
};
