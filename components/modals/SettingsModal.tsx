'use client';

import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Smartphone, Check, X, ShieldAlert, Mic, MessageSquare } from 'lucide-react';
import { soundEngine } from '@/lib/audio';
import { audioTauntsEngine } from '@/lib/audio-taunts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(() => soundEngine.getHapticsEnabled());
  const [commentatorEnabled, setCommentatorEnabled] = useState(() => audioTauntsEngine.getCommentatorEnabled());
  const [tauntsEnabled, setTauntsEnabled] = useState(() => audioTauntsEngine.getTauntsEnabled());
  const [voiceVolume, setVoiceVolume] = useState(() => audioTauntsEngine.getVolume());

  const [supportsVibration] = useState(() => (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  ));

  if (!isOpen) return null;

  const toggleSound = () => {
    const nextMute = !isMuted;
    soundEngine.setMuted(nextMute);
    setIsMuted(nextMute);
    if (!nextMute) {
      soundEngine.playClick();
    }
  };

  const toggleHaptics = () => {
    const nextHaptics = !isHapticsEnabled;
    soundEngine.setHapticsEnabled(nextHaptics);
    setIsHapticsEnabled(nextHaptics);
    if (nextHaptics) {
      soundEngine.vibrateAction();
    }
  };

  const toggleCommentator = () => {
    const nextVal = !commentatorEnabled;
    audioTauntsEngine.setCommentatorEnabled(nextVal);
    setCommentatorEnabled(nextVal);
    if (nextVal) {
      audioTauntsEngine.speakTaunt('Voice commentator enabled', 'commentator');
    }
  };

  const toggleTaunts = () => {
    const nextVal = !tauntsEnabled;
    audioTauntsEngine.setTauntsEnabled(nextVal);
    setTauntsEnabled(nextVal);
    if (nextVal) {
      audioTauntsEngine.speakTaunt('Offline taunts enabled', 'taunt');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    audioTauntsEngine.setVolume(newVol);
    setVoiceVolume(newVol);
  };

  return (
    <div
      id="settings-modal-overlay"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="settings-modal-card"
        className="bg-black/90 border border-white/10 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-red-600/20 border border-red-500/40 rounded-xl flex items-center justify-center text-red-400">
              <Settings className="w-5 h-5 text-red-400 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase leading-none">
                SETTINGS
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Audio &amp; Tactile Feedback Controls
              </p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold border border-white/10 transition-colors"
            title="Close Settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Stack */}
        <div className="space-y-4">
          {/* Sound Effects Toggle */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Sound Effects</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  Synthesized web audio for card plays, trick sweeps, and alerts
                </p>
              </div>
            </div>
            <button
              id="toggle-sound-settings-btn"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 border ${
                !isMuted
                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {!isMuted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ON</span>
                </>
              ) : (
                <span>MUTED</span>
              )}
            </button>
          </div>

          {/* Haptic Feedback Toggle */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white">Haptic Feedback</h3>
                  {supportsVibration ? (
                    <span className="text-[9px] font-mono font-bold bg-green-950 text-green-400 border border-green-800/60 px-1.5 py-0.2 rounded">
                      SUPPORTED
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60 px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                      <ShieldAlert className="w-2.5 h-2.5 inline mr-0.5" />
                      TOUCH ONLY
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Tactile device vibrations on card plays, trick sweeps, and turn prompts
                </p>
              </div>
            </div>
            <button
              id="toggle-haptics-settings-btn"
              onClick={toggleHaptics}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 border ${
                isHapticsEnabled
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {isHapticsEnabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>ON</span>
                </>
              ) : (
                <span>OFF</span>
              )}
            </button>
          </div>

          {/* Voice Commentator Toggle */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Mic className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Voice Commentator</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  100% offline speech synthesis play-by-play announcements
                </p>
              </div>
            </div>
            <button
              id="toggle-commentator-settings-btn"
              onClick={toggleCommentator}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 border ${
                commentatorEnabled
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {commentatorEnabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                  <span>ON</span>
                </>
              ) : (
                <span>OFF</span>
              )}
            </button>
          </div>

          {/* Offline Taunts Toggle */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between space-x-3">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Offline Taunts</h3>
                <p className="text-xs text-slate-400 leading-snug">
                  Spoken voice reactions on emoji taps and penalty card plays
                </p>
              </div>
            </div>
            <button
              id="toggle-taunts-settings-btn"
              onClick={toggleTaunts}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center space-x-1.5 shrink-0 border ${
                tauntsEnabled
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {tauntsEnabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-purple-400" />
                  <span>ON</span>
                </>
              ) : (
                <span>OFF</span>
              )}
            </button>
          </div>

          {/* Voice Volume Slider */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Voice Volume</span>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400">{Math.round(voiceVolume * 100)}%</span>
            </div>
            <input
              id="voice-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={voiceVolume}
              onChange={handleVolumeChange}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Footer Button */}
        <div className="pt-2">
          <button
            id="done-settings-btn"
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all uppercase tracking-wider text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
