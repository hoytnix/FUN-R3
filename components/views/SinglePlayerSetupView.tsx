'use client';

import React from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { BotDifficulty } from '@/lib/bot-engine';
import { soundEngine } from '@/lib/audio';
import { AppView, GameMode } from './HubView';
import { AvatarSelector } from '@/components/ui/AvatarSelector';

interface SinglePlayerSetupViewProps {
  spName: string;
  setSpName: (name: string) => void;
  spAvatar: string;
  setSpAvatar: (avatar: string) => void;
  spDifficulty: BotDifficulty;
  setSpDifficulty: (diff: BotDifficulty) => void;
  onBack: () => void;
  onStartMatch: (mode: GameMode, view: AppView) => void;
}

const EMOJI_OPTIONS = ['🖕', '🃏', '👑', '💀', '🔥', '🎯', '🚀', '💎', '🦊', '⚡'];

export const SinglePlayerSetupView: React.FC<SinglePlayerSetupViewProps> = ({
  spName,
  setSpName,
  spAvatar,
  setSpAvatar,
  spDifficulty,
  setSpDifficulty,
  onBack,
  onStartMatch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px-32px)] p-4 max-w-md mx-auto select-none space-y-6">
      <div className="w-full flex items-center justify-between">
        <button
          id="sp-back-to-hub-btn"
          onClick={onBack}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
          Single Player Setup
        </span>
      </div>

      <div className="w-full bg-black/60 border border-purple-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-white uppercase">
            Play vs. 3 AI Opponents
          </h2>
          <p className="text-xs text-slate-400">
            Configure your profile and choose AI Bot difficulty level.
          </p>
        </div>

        {/* Player Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Your Display Name</label>
          <input
            id="sp-player-name-input"
            type="text"
            maxLength={15}
            value={spName}
            onChange={(e) => {
              setSpName(e.target.value);
              if (typeof window !== 'undefined') {
                localStorage.setItem('fun_playerName', e.target.value);
              }
            }}
            className="w-full px-3.5 py-2.5 bg-black/80 border border-white/10 focus:border-purple-500 rounded-xl text-sm font-semibold text-white outline-none transition-all"
          />
        </div>

        {/* Avatar Picker */}
        <AvatarSelector
          selectedAvatar={spAvatar}
          onSelectAvatar={(emoji) => {
            setSpAvatar(emoji);
            if (typeof window !== 'undefined') {
              localStorage.setItem('fun_playerAvatar', emoji);
            }
          }}
          colorTheme="purple"
        />

        {/* Difficulty & AI Personality Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">AI Strategist Engine &amp; Personality</label>
            <span className="text-[10px] text-purple-400 font-mono font-bold uppercase">
              {spDifficulty === 'EASY' || spDifficulty === 'CASUAL'
                ? '60s • Casual'
                : spDifficulty === 'HARD' || spDifficulty === 'CUTTHROAT'
                ? '20s • Cutthroat'
                : spDifficulty === 'CHAOS'
                ? '30s • Chaos'
                : '40s • Balanced'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CASUAL' as BotDifficulty, label: '🟢 Casual', desc: 'Naive suit follow' },
              { id: 'CUTTHROAT' as BotDifficulty, label: '🔴 Cutthroat', desc: 'Card counting' },
              { id: 'CHAOS' as BotDifficulty, label: '⚡ Chaos', desc: 'High variance' },
            ].map((item) => (
              <button
                key={item.id}
                id={`difficulty-${item.id.toLowerCase()}-btn`}
                onClick={() => setSpDifficulty(item.id)}
                className={`py-2.5 px-1.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  spDifficulty === item.id || (item.id === 'CASUAL' && spDifficulty === 'EASY') || (item.id === 'CUTTHROAT' && spDifficulty === 'HARD')
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                    : 'bg-black/80 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-black text-xs uppercase">
                  {item.label}
                </span>
                <span className="text-[9px] opacity-80 mt-0.5 text-center leading-tight">
                  {item.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          id="launch-single-player-btn"
          onClick={() => {
            soundEngine.playClick();
            onStartMatch('SINGLE_PLAYER', 'SINGLE_PLAYER_GAME');
          }}
          className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Match vs 3 Bots</span>
        </button>
      </div>
    </div>
  );
};
