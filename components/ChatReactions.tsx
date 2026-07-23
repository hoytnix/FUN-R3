'use client';

import React, { useState, useEffect } from 'react';
import { Send, Smile, X, Sparkles } from 'lucide-react';
import { FloatingReaction, ChatMessage } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { speakTaunt } from '@/lib/audio-taunts';

const EMOJIS = ['🤣', '😂', '🖕', '😭', '🔥', '👑', '🎯', '🤡', '💀', '💩', '👏', '💔'];
const EMOJI_TAUNTS: Record<string, string> = {
  '🤣': 'Ha ha ha! What a terrible play!',
  '😂': 'Laughable effort right there!',
  '🖕': 'Fuck your neighbor!',
  '😭': 'Cry me a river!',
  '🔥': 'You are on fire!',
  '👑': 'Bow down to the king!',
  '🎯': 'Bullseye! Right on target!',
  '🤡': 'What a total clown move!',
  '💀': 'Dead on arrival!',
  '💩': 'Total garbage play!',
  '👏': 'Give them a big round of applause!',
  '💔': 'Total heartbreaker!',
};

const QUICK_PHRASES = [
  '🖕 Ur Neighbor!',
  'Nice trick!',
  'Watch out for the Queen! 👑',
  'Oops... 😭',
  'Ha ha, nice try! 🤣',
  'Gg!',
];

interface ChatReactionsProps {
  messages: ChatMessage[];
  reactions: FloatingReaction[];
  onSendMessage: (text: string) => void;
  onSendReaction: (emoji: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const ChatReactions: React.FC<ChatReactionsProps> = ({
  messages,
  reactions,
  onSendMessage,
  onSendReaction,
  isOpen: externalIsOpen,
  onToggle: externalOnToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setOpenState = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isOpen) : val;
    if (externalOnToggle) {
      if (nextVal !== isOpen) externalOnToggle();
    } else {
      setInternalIsOpen(nextVal);
    }
  };
  const [text, setText] = useState('');
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const activeFloaters = reactions.filter(
    (r) => now > 0 && now - r.timestamp < 3500
  );

  const handleSend = () => {
    if (!text.trim()) return;
    soundEngine.playClick();
    onSendMessage(text.trim());
    speakTaunt(text.trim(), 'taunt');
    setText('');
  };

  const handleEmojiClick = (emoji: string) => {
    soundEngine.playClick();
    onSendReaction(emoji);
    const spoken = EMOJI_TAUNTS[emoji] || 'Taunt!';
    speakTaunt(spoken, 'taunt');
  };

  return (
    <>
      {/* Floating Animated Emojis Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {activeFloaters.map((floater) => {
          const age = now - floater.timestamp;
          const opacity = Math.max(0, 1 - age / 3000);

          return (
            <div
              key={floater.id}
              className="absolute text-4xl animate-bounce transition-all duration-1000"
              style={{
                bottom: `${15 + (Math.sin(floater.timestamp) * 30 + 30)}%`,
                left: `${10 + (floater.timestamp % 80)}%`,
                opacity,
              }}
            >
              {floater.emoji}
            </div>
          );
        })}
      </div>

      {/* Context Modal for Selecting Emoticons & Taunts */}
      {isOpen && (
        <div className="fixed bottom-[185px] xs:bottom-[195px] sm:bottom-[215px] left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] w-[92%] max-w-sm flex flex-col space-y-3 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <span className="text-lg">🤣</span>
              <span>Select Emoticon or Taunt</span>
            </span>
            <button
              onClick={() => setOpenState(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Full Emoji Grid */}
          <div className="grid grid-cols-6 gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  handleEmojiClick(emoji);
                }}
                className="text-2xl p-1 rounded-lg hover:bg-white/10 hover:scale-125 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                title={EMOJI_TAUNTS[emoji] || 'Taunt'}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div className="h-28 overflow-y-auto space-y-1.5 text-xs pr-1">
            {messages.length === 0 ? (
              <div className="text-slate-500 text-center text-[11px] pt-6 italic">
                Tap an emoji or quick phrase above to speak aloud!
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-slate-950/90 p-2 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-400 mr-1.5">{m.playerName}:</span>
                  <span className="text-slate-200">{m.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Quick Phrases */}
          <div className="flex flex-wrap gap-1">
            {QUICK_PHRASES.map((phrase) => (
              <button
                key={phrase}
                onClick={() => {
                  onSendMessage(phrase);
                  speakTaunt(phrase.replace(/[^\w\s!]/gi, '').trim() || phrase, 'taunt');
                  setOpenState(false);
                }}
                className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded-lg border border-slate-700/60 cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Custom Text Input field */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              maxLength={40}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Speak custom taunt..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
