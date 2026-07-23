import React from 'react';
import { Check } from 'lucide-react';
import { EmojiItem } from '@/lib/emoji-data';

interface EmojiCategoryGridProps {
  filteredEmojis: EmojiItem[];
  currentEmoji?: string;
  searchQuery: string;
  onSelect: (emoji: string) => void;
}

export const EmojiCategoryGrid: React.FC<EmojiCategoryGridProps> = ({
  filteredEmojis,
  currentEmoji,
  searchQuery,
  onSelect,
}) => {
  if (filteredEmojis.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl mx-auto text-slate-400">
          🔍
        </div>
        <div className="text-sm font-bold text-slate-300">
          No preset emojis found matching &quot;{searchQuery}&quot;
        </div>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Tip: You can paste or type ANY native emoji directly into the search bar above to use it!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
      {filteredEmojis.map((item) => {
        const isSelected = currentEmoji === item.emoji;
        return (
          <button
            key={`${item.category}-${item.name}-${item.emoji}`}
            type="button"
            onClick={() => onSelect(item.emoji)}
            title={`${item.name} (${item.emoji})`}
            className={`group relative p-2.5 rounded-2xl text-2xl flex items-center justify-center border transition-all cursor-pointer ${
              isSelected
                ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-black/60 border-white/10 hover:border-amber-400/60 hover:bg-white/10 hover:scale-110'
            }`}
          >
            <span>{item.emoji}</span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-black rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
