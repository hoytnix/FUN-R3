'use client';

import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTutorial?: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onOpenTutorial }) => {
  if (!isOpen) return null;

  return (
    <div
      id="rules-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="rules-modal-card"
        className="bg-black/90 border border-white/10 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(220,38,38,0.4)] text-white">
              🖕
            </div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">
              RULES OF <span className="text-red-500">F.U.N.</span>
            </h2>
          </div>
          <button
            id="close-rules-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold border border-white/10"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-slate-300">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <h3 className="font-bold text-amber-400 text-base mb-1">🎯 Objective</h3>
            <p>
              In <span className="font-bold text-white">&quot;🖕 Ur Neighbor&quot;</span>, 4 players compete across 4 rounds. Lowest overall total score after Round 4 wins!
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl space-y-1">
              <div className="flex items-center space-x-2 font-bold text-red-400">
                <span className="px-2 py-0.5 bg-red-900/60 text-red-300 text-xs rounded-full">Round 1</span>
                <span>Hearts</span>
              </div>
              <p className="text-xs text-slate-300">
                Avoid taking trick cards containing <span className="text-red-400 font-bold">Hearts</span>. Each Heart card taken = <span className="font-bold text-white">+5 pts</span>.
              </p>
            </div>

            <div className="p-3 bg-indigo-950/40 border border-indigo-900/50 rounded-xl space-y-1">
              <div className="flex items-center space-x-2 font-bold text-indigo-400">
                <span className="px-2 py-0.5 bg-indigo-900/60 text-indigo-300 text-xs rounded-full">Round 2</span>
                <span>Royal Suite</span>
              </div>
              <p className="text-xs text-slate-300">
                Avoid taking <span className="font-bold text-indigo-300">Heart Face Cards</span> (Jack, Queen, King of Hearts). Each Heart Royal taken = <span className="font-bold text-white">+15 pts</span>. All other cards = 0 pts.
              </p>
            </div>

            <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl space-y-1">
              <div className="flex items-center space-x-2 font-bold text-amber-400">
                <span className="px-2 py-0.5 bg-amber-900/60 text-amber-300 text-xs rounded-full">Round 3</span>
                <span>Queen of Hearts (Sudden Death 💀)</span>
              </div>
              <p className="text-xs text-slate-300">
                Avoid taking the <span className="font-bold text-red-400">Queen of Hearts</span>! The round ends <span className="font-bold text-amber-300 underline">IMMEDIATELY</span> the moment a player takes a trick containing Q♥ (<span className="font-bold text-red-400">+50 pts</span>).
              </p>
            </div>

            <div className="p-3 bg-green-950/40 border border-green-900/50 rounded-xl space-y-1">
              <div className="flex items-center space-x-2 font-bold text-green-400">
                <span className="px-2 py-0.5 bg-green-900/60 text-green-300 text-xs rounded-full">Round 4</span>
                <span>Around The World (Solitaire Race 🏎️)</span>
              </div>
              <p className="text-xs text-slate-300">
                Turn-by-turn Solitaire shedding race! Play <span className="font-bold text-green-300">7s</span> to open suit lines, then build up to Ace and down to 2.
              </p>
              <div className="grid grid-cols-4 gap-1.5 text-[11px] text-center pt-1 font-bold">
                <div className="p-1 bg-green-900/40 rounded text-green-300">1st: 0 pts</div>
                <div className="p-1 bg-white/5 rounded text-slate-300">2nd: +10 pts</div>
                <div className="p-1 bg-amber-900/40 rounded text-amber-300">3rd: +25 pts</div>
                <div className="p-1 bg-red-900/40 rounded text-red-300">4th: +50 pts</div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl text-xs space-y-1 border border-white/10">
            <div className="font-bold text-slate-200">👑 Trick-Taking Mechanics</div>
            <p className="text-slate-400">
              In Rounds 1-3, players must follow the suit led if possible. Whatever suit is led becomes the winning suit for that trick — the highest card played of the led suit wins the trick!
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          {onOpenTutorial && (
            <button
              id="rules-interactive-tutorial-btn"
              onClick={() => {
                onClose();
                onOpenTutorial();
              }}
              className="w-full sm:flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all uppercase tracking-wider text-xs cursor-pointer"
            >
              Play Interactive Tutorial
            </button>
          )}
          <button
            id="got-it-rules-btn"
            onClick={onClose}
            className="w-full sm:flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all uppercase tracking-wider text-xs cursor-pointer"
          >
            Got It! Let&apos;s Play
          </button>
        </div>
      </div>
    </div>
  );
};
