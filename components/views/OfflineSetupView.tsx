'use client';

import React, { useState } from 'react';
import { ArrowLeft, Play, Clock, Sparkles } from 'lucide-react';
import { DEFAULT_AVATARS } from '@/lib/offline-engine';
import { soundEngine } from '@/lib/audio';
import { EmojiPickerModal } from '@/components/ui/EmojiPickerModal';

interface OfflineSetupViewProps {
  localNames: string[];
  setLocalNames: (names: string[]) => void;
  localAvatars: string[];
  setLocalAvatars: (avatars: string[]) => void;
  localTimerSeconds?: number;
  setLocalTimerSeconds?: (sec: number) => void;
  onBack: () => void;
  onStartLocalMatch: () => void;
}

export const OfflineSetupView: React.FC<OfflineSetupViewProps> = ({
  localNames,
  setLocalNames,
  localAvatars,
  setLocalAvatars,
  localTimerSeconds = 40,
  setLocalTimerSeconds,
  onBack,
  onStartLocalMatch,
}) => {
  const [activePickerIdx, setActivePickerIdx] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-32px)] p-4 max-w-md mx-auto select-none space-y-6">
      <div className="w-full flex items-center justify-between">
        <button
          id="back-to-hub-btn"
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
          Local Pass &amp; Play Setup
        </span>
      </div>

      <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white uppercase">
            Setup 4 Local Players
          </h2>
          <p className="text-xs text-slate-400">
            Enter names for each player sharing this device.
          </p>
        </div>

        <div className="space-y-3">
          {localNames.map((name, i) => (
            <div key={i} className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-500 w-5">
                P{i + 1}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setActivePickerIdx(i);
                }}
                className="p-2 bg-black/80 border border-white/10 hover:border-green-400 rounded-xl text-xl hover:scale-105 transition-all relative group cursor-pointer"
                title="Click to search & select emoji"
              >
                <span>{localAvatars[i]}</span>
                <span className="absolute -top-1 -right-1 p-0.5 bg-green-500 text-black rounded-full text-[9px]">
                  ✨
                </span>
              </button>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const newNames = [...localNames];
                  newNames[i] = e.target.value;
                  setLocalNames(newNames);
                }}
                placeholder={`Player ${i + 1}`}
                className="flex-1 px-3.5 py-2 bg-black/80 border border-white/10 focus:border-green-500 rounded-xl text-sm font-semibold text-white outline-none transition-all"
              />
            </div>
          ))}
        </div>

        {/* Emoji Picker Modal for Offline Players */}
        {activePickerIdx !== null && (
          <EmojiPickerModal
            isOpen={activePickerIdx !== null}
            onClose={() => setActivePickerIdx(null)}
            onSelectEmoji={(selectedEmoji) => {
              if (activePickerIdx !== null) {
                const newAvatars = [...localAvatars];
                newAvatars[activePickerIdx] = selectedEmoji;
                setLocalAvatars(newAvatars);
              }
            }}
            currentEmoji={activePickerIdx !== null ? localAvatars[activePickerIdx] : undefined}
          />
        )}

        {/* Turn Timer Duration Selector */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-green-400" />
              <span>Turn Timer Duration</span>
            </label>
            <span className="text-[10px] text-green-400 font-mono font-bold">
              {localTimerSeconds === 60 ? '60s Timer' : localTimerSeconds === 40 ? '40s Timer' : '20s Timer'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { sec: 60, label: '🟢 60s', sub: 'Easy' },
              { sec: 40, label: '🟡 40s', sub: 'Medium' },
              { sec: 20, label: '🔴 20s', sub: 'Hard' },
            ].map(({ sec, label, sub }) => (
              <button
                key={sec}
                type="button"
                id={`pass-play-timer-${sec}s-btn`}
                onClick={() => {
                  soundEngine.playClick();
                  if (setLocalTimerSeconds) setLocalTimerSeconds(sec);
                }}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  localTimerSeconds === sec
                    ? 'bg-green-600 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                    : 'bg-black/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-black text-xs uppercase">{label}</span>
                <span className="text-[10px] opacity-80 font-mono mt-0.5">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          id="launch-local-match-btn"
          onClick={() => {
            soundEngine.playClick();
            onStartLocalMatch();
          }}
          className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Launch Pass &amp; Play Match ({localTimerSeconds}s)</span>
        </button>
      </div>
    </div>
  );
};

