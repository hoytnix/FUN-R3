import React from 'react';
import { User, Plus, Users, Clock } from 'lucide-react';
import { AvatarSelector } from '@/components/ui/AvatarSelector';
import { soundEngine } from '@/lib/audio';

interface LobbyRoomControlsProps {
  name: string;
  setName: (name: string) => void;
  avatar: string;
  setAvatar: (avatar: string) => void;
  selectedTimer: number;
  setSelectedTimer: (timer: number) => void;
  joinCode: string;
  setJoinCode: (code: string) => void;
  tab: 'create' | 'join';
  setTab: (tab: 'create' | 'join') => void;
  onCreate: () => void;
  onJoin: () => void;
}

export const LobbyRoomControls: React.FC<LobbyRoomControlsProps> = ({
  name,
  setName,
  avatar,
  setAvatar,
  selectedTimer,
  setSelectedTimer,
  joinCode,
  setJoinCode,
  tab,
  setTab,
  onCreate,
  onJoin,
}) => {
  return (
    <div className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-md space-y-5">
      {/* Tab Selector */}
      <div className="grid grid-cols-2 p-1 bg-black/80 rounded-xl text-xs font-bold border border-white/10">
        <button
          id="tab-create-room"
          onClick={() => setTab('create')}
          className={`py-2 rounded-lg transition-all ${
            tab === 'create'
              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Room
        </button>
        <button
          id="tab-join-room"
          onClick={() => setTab('join')}
          className={`py-2 rounded-lg transition-all ${
            tab === 'join'
              ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Join Room
        </button>
      </div>

      {/* Player Setup Form */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-red-400" />
            <span>Your Display Name</span>
          </label>
          <input
            id="player-name-input"
            type="text"
            maxLength={15}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name..."
            className="w-full px-3.5 py-2.5 bg-black/80 border border-white/10 focus:border-red-500 rounded-xl text-sm font-semibold text-white outline-none transition-all"
          />
        </div>

        {/* Avatar Selector */}
        <AvatarSelector
          selectedAvatar={avatar}
          onSelectAvatar={(newAvatar) => {
            setAvatar(newAvatar);
            if (typeof window !== 'undefined') {
              localStorage.setItem('fun_playerAvatar', newAvatar);
            }
          }}
          colorTheme="red"
        />

        {/* Timer Selector for Create Room */}
        {tab === 'create' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Turn Timer Duration</span>
              </label>
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                {selectedTimer === 60 ? 'Easy (60s)' : selectedTimer === 40 ? 'Medium (40s)' : 'Hard Blitz (20s)'}
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
                  id={`online-timer-${sec}s-btn`}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedTimer(sec);
                  }}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    selectedTimer === sec
                      ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                      : 'bg-black/80 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="font-black text-xs uppercase">{label}</span>
                  <span className="text-[10px] opacity-80 font-mono mt-0.5">{sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Join Code input if tab === 'join' */}
        {tab === 'join' && (
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-slate-300">4-Digit Room Code</label>
            <input
              id="join-code-input"
              type="text"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. FUN4"
              className="w-full px-3.5 py-2.5 bg-black/80 border border-white/10 focus:border-red-500 rounded-xl text-sm font-mono font-black text-red-400 uppercase tracking-widest outline-none transition-all text-center"
            />
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      {tab === 'create' ? (
        <button
          id="create-room-btn"
          onClick={onCreate}
          disabled={!name.trim()}
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Create 4-Player Room ({selectedTimer}s Timer)</span>
        </button>
      ) : (
        <button
          id="join-room-btn"
          onClick={onJoin}
          disabled={!name.trim() || !joinCode.trim()}
          className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-black text-sm rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer uppercase tracking-wider"
        >
          <Users className="w-4 h-4" />
          <span>Join Match</span>
        </button>
      )}
    </div>
  );
};
