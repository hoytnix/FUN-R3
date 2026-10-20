'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Smile } from 'lucide-react';
import { EMOJI_CATEGORIES, EMOJI_DICTIONARY } from '@/lib/emoji-data';
import { soundEngine } from '@/lib/audio';
import { EmojiCategoryGrid } from '@/components/ui/EmojiCategoryGrid';

interface EmojiPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  currentEmoji?: string;
}

export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
  currentEmoji,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customInput, setCustomInput] = useState('');

  const typedEmoji = useMemo(() => {
    const text = (customInput || searchQuery).trim();
    if (!text) return null;
    const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/u;
    if (emojiRegex.test(text)) {
      const match = text.match(/(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu);
      return match ? match[0] : text;
    }
    return null;
  }, [searchQuery, customInput]);

  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return EMOJI_DICTIONARY.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (!query) return true;
      if (item.emoji.includes(query)) return true;
      if (item.name.toLowerCase().includes(query)) return true;
      if (item.tags.some((tag) => tag.toLowerCase().includes(query))) return true;
      return false;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelect = (emoji: string) => {
    soundEngine.playClick();
    onSelectEmoji(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-black to-slate-950 border border-slate-700/80 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-lg shadow-md">
                ✨
              </div>
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center space-x-2">
                  <span>Emoji &amp; Avatar Gallery</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Search or paste any emoji to use as your player avatar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="p-4 space-y-3 bg-black/40 border-b border-white/5">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emoji (e.g. dragon, fire, cat, win)..."
                className="w-full pl-10 pr-9 py-2.5 bg-black/80 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl text-sm font-semibold text-white outline-none placeholder:text-slate-500 transition-all"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Emoji Typed / Pasted Banner */}
            {typedEmoji && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2.5 bg-amber-950/60 border border-amber-500/50 rounded-xl flex items-center justify-between space-x-3 shadow-inner"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl p-1 bg-black/60 rounded-lg border border-amber-400/40">
                    {typedEmoji}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Custom Emoji Detected
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Click button to apply &quot;{typedEmoji}&quot;
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelect(typedEmoji)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg shadow uppercase transition-transform active:scale-95 cursor-pointer"
                >
                  Use &quot;{typedEmoji}&quot;
                </button>
              </motion.div>
            )}

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {EMOJI_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Grid List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
            <EmojiCategoryGrid
              filteredEmojis={filteredEmojis}
              currentEmoji={currentEmoji}
              searchQuery={searchQuery}
              onSelect={handleSelect}
            />
          </div>

          {/* Footer - Direct Paste or Manual Custom Input */}
          <div className="p-3.5 bg-black/80 border-t border-white/10 flex items-center justify-between space-x-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <Smile className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-[11px]">
                Or paste/type emoji:
              </span>
            </div>

            <div className="flex items-center space-x-2 flex-1 max-w-[200px]">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Paste emoji..."
                className="w-full px-2.5 py-1.5 bg-black border border-white/15 focus:border-amber-400 rounded-lg text-xs font-semibold text-white outline-none text-center"
              />
              <button
                type="button"
                disabled={!typedEmoji}
                onClick={() => {
                  if (typedEmoji) handleSelect(typedEmoji);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-black text-xs rounded-lg uppercase transition-all cursor-pointer whitespace-nowrap"
              >
                Apply
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
