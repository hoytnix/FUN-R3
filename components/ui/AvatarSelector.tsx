'use client';

import React, { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { EmojiPickerModal } from '@/components/ui/EmojiPickerModal';
import { soundEngine } from '@/lib/audio';

export const DEFAULT_PRESET_AVATARS = [
  '🖕', '🃏', '👑', '💀', '🔥', '🎯', '🚀', '💎', '🦊'
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  presetAvatars?: string[];
  colorTheme?: 'red' | 'purple' | 'green' | 'amber';
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelectAvatar,
  presetAvatars = DEFAULT_PRESET_AVATARS,
  colorTheme = 'red',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if selected avatar is among presets
  const isPresetSelected = presetAvatars.includes(selectedAvatar);

  // Styling based on theme
  const themeStyles = {
    red: {
      active: 'bg-red-600/30 border-red-500 ring-2 ring-red-500 text-white',
      badge: 'bg-red-500 text-white',
      otherActive: 'bg-red-600/40 border-red-400 ring-2 ring-red-500 text-red-200',
    },
    purple: {
      active: 'bg-purple-600/30 border-purple-500 ring-2 ring-purple-500 text-white',
      badge: 'bg-purple-500 text-white',
      otherActive: 'bg-purple-600/40 border-purple-400 ring-2 ring-purple-500 text-purple-200',
    },
    green: {
      active: 'bg-green-600/30 border-green-500 ring-2 ring-green-500 text-white',
      badge: 'bg-green-500 text-white',
      otherActive: 'bg-green-600/40 border-green-400 ring-2 ring-green-500 text-green-200',
    },
    amber: {
      active: 'bg-amber-600/30 border-amber-500 ring-2 ring-amber-500 text-white',
      badge: 'bg-amber-500 text-white',
      otherActive: 'bg-amber-600/40 border-amber-400 ring-2 ring-amber-500 text-amber-200',
    },
  }[colorTheme];

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300">Choose Avatar</label>
        <span className="text-[10px] text-slate-400 font-mono">
          Selected: <span className="text-lg leading-none align-middle ml-1">{selectedAvatar}</span>
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {/* First 9 Preset Options */}
        {presetAvatars.slice(0, 9).map((emoji) => {
          const isSelected = selectedAvatar === emoji;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onSelectAvatar(emoji);
              }}
              className={`p-2 text-xl rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isSelected
                  ? themeStyles.active
                  : 'bg-black/80 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              {emoji}
            </button>
          );
        })}

        {/* 10th Option: "Other..." opens Search Modal */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            setIsModalOpen(true);
          }}
          title="Search & select any emoji..."
          className={`p-2 text-xs font-black rounded-xl border transition-all flex flex-col items-center justify-center space-y-0.5 cursor-pointer relative ${
            !isPresetSelected
              ? themeStyles.otherActive
              : 'bg-black/80 border-white/10 hover:border-amber-400/80 hover:bg-amber-950/20 text-slate-300'
          }`}
        >
          {!isPresetSelected ? (
            <>
              <span className="text-xl leading-none">{selectedAvatar}</span>
              <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-amber-400">
                Other...
              </span>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-0.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <Search className="w-3 h-3" />
              </div>
              <span className="text-[9px] uppercase font-mono font-bold tracking-tight text-slate-300">
                Other...
              </span>
            </>
          )}
        </button>
      </div>

      {/* Emoji Picker Modal */}
      <EmojiPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectEmoji={(emoji) => {
          onSelectAvatar(emoji);
        }}
        currentEmoji={selectedAvatar}
      />
    </div>
  );
};
