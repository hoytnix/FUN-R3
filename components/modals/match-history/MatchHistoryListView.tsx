'use client';

import React from 'react';
import { History, Sparkles, Trash2, Download, Trophy, CheckCircle2, Play } from 'lucide-react';
import { MatchRecord } from '@/lib/types/replay';

interface MatchHistoryListViewProps {
  matches: MatchRecord[];
  onLoadDemo: () => void;
  onClearAll: () => void;
  onSelectMatch: (match: MatchRecord) => void;
  onDeleteMatch: (id: string, e: React.MouseEvent) => void;
  onExportJson: (match: MatchRecord, e: React.MouseEvent) => void;
}

export const MatchHistoryListView: React.FC<MatchHistoryListViewProps> = ({
  matches,
  onLoadDemo,
  onClearAll,
  onSelectMatch,
  onDeleteMatch,
  onExportJson,
}) => {
  return (
    <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            Logged Matches & Event-Sourced Records
          </h3>
          <p className="text-xs text-slate-400">
            Select a recorded match to launch the Hash-Verified Replay Engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onLoadDemo}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 rounded-lg text-xs font-bold text-white shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Demo Championship Match</span>
          </button>
          {matches.length > 0 && (
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 rounded-lg text-xs font-bold text-red-300 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-3">
          <History className="w-12 h-12 text-slate-700" />
          <p className="text-sm font-bold">No recorded match logs found</p>
          <p className="text-xs text-slate-600">
            Play local or single-player matches or click above to load the Demo Championship Match!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => onSelectMatch(match)}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 rounded-xl p-4 transition-all duration-200 shadow-lg cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/80 text-red-400 border border-red-800/60">
                      {match.mode}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(match.createdAt).toLocaleDateString()} {new Date(match.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white mt-1 group-hover:text-red-400 transition-colors flex items-center space-x-2">
                    <span>Match vs {match.players.filter((p) => p.seatIndex !== 0).map((p) => p.name).join(', ')}</span>
                  </h4>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => onExportJson(match, e)}
                    title="Export JSON Replay Log"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => onDeleteMatch(match.id, e)}
                    title="Delete Match Record"
                    className="p-1.5 bg-slate-800 hover:bg-red-900/60 rounded-lg text-slate-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Winner & Stats Summary */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                    {match.winnerAvatar || '👑'}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                      <Trophy className="w-3 h-3 text-amber-400 inline" />
                      <span>Winner</span>
                    </p>
                    <p className="text-xs font-bold text-amber-300">
                      {match.winnerName} ({match.finalScores[match.winnerPlayerId] ?? 0} pts)
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <p className="text-slate-400">{match.totalSteps} Action Steps</p>
                  <p className="text-emerald-400 font-bold text-[10px] flex items-center justify-end space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>HASH VERIFIED</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center space-x-1 text-slate-400">
                  {match.players.map((p) => (
                    <span key={p.id} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] font-bold">
                      {p.avatar} {p.name.split(' ')[0]}
                    </span>
                  ))}
                </div>
                <span className="text-red-400 group-hover:translate-x-1 transition-transform font-bold flex items-center space-x-1">
                  <span>Launch Replay</span>
                  <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
