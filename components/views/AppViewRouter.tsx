import React from 'react';
import { cn } from '@/lib/utils';
import { HubView } from '@/components/views/HubView';
import { SinglePlayerSetupView } from '@/components/views/SinglePlayerSetupView';
import { SinglePlayerBoard } from '@/components/SinglePlayerBoard';
import { OfflineSetupView } from '@/components/views/OfflineSetupView';
import { Lobby } from '@/components/Lobby';
import { GameBoard } from '@/components/GameBoard';
import { PassShield } from '@/components/PassShield';
import { GameOverOverlay } from '@/components/game/GameOverOverlay';
import { ArrowLeft } from 'lucide-react';
import { RoomState, Player, Card, BotDifficulty } from '@/lib/types';
import { OfflineGameState } from '@/lib/offline-engine';

export type AppView =
  | 'HUB'
  | 'SINGLE_PLAYER_SETUP'
  | 'SINGLE_PLAYER_GAME'
  | 'OFFLINE_SETUP'
  | 'ONLINE_LOBBY'
  | 'GAME';

export type GameMode = 'ONLINE' | 'SINGLE_PLAYER' | 'OFFLINE';

interface AppViewRouterProps {
  view: AppView;
  mode: GameMode;
  pwaPrompt: any;
  isPwaInstalled: boolean;
  onInstallPwa: () => void;
  offlineState: OfflineGameState | null;
  onResumeLocalMatch: () => void;
  onClearLocalSession: () => void;
  room: RoomState | null;
  spRoom: RoomState | null;
  setMode: (m: GameMode) => void;
  setView: (v: AppView) => void;
  onLeaveOnlineRoom: () => void;
  onOpenTutorial?: () => void;
  onOpenMatchHistory?: () => void;
  spName: string;
  setSpName: (name: string) => void;
  spAvatar: string;
  setSpAvatar: (avatar: string) => void;
  spDifficulty: BotDifficulty;
  setSpDifficulty: (d: BotDifficulty) => void;
  onSpRoomChange: (r: RoomState) => void;
  localNames: string[];
  setLocalNames: (names: string[]) => void;
  localAvatars: string[];
  setLocalAvatars: (avatars: string[]) => void;
  localTimerSeconds: number;
  setLocalTimerSeconds: (sec: number) => void;
  onStartLocalMatch: () => void;
  myPlayerId: string;
  onCreateRoom: (name: string, avatar: string, turnTimerSeconds?: number, difficulty?: BotDifficulty) => void;
  onJoinRoom: (code: string, name: string, avatar: string) => void;
  onStartOnlineGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (seatIndex: number) => void;
  activeOfflineRoomState: RoomState | null;
  currentOfflinePlayer: Player | undefined;
  onPlayOfflineCard: (card: Card) => void;
  onPassOfflineSolitaire: () => void;
  onAdvanceOfflineRound: () => void;
  onToggleOfflineShield: () => void;
  onDismissOfflineShield: () => void;
  onInitOfflineGame: () => void;
  executeOnlineCardPlay: (room: RoomState, player: Player, card: Card) => Promise<void>;
  handleOnlinePassSolitaire: (room: RoomState, player: Player) => Promise<void>;
  handleNextOnlineRound: () => Promise<void>;
  isEmojiModalOpen?: boolean;
  onToggleEmojiModal?: () => void;
}

export const AppViewRouter: React.FC<AppViewRouterProps> = ({
  view,
  mode,
  pwaPrompt,
  isPwaInstalled,
  onInstallPwa,
  offlineState,
  onResumeLocalMatch,
  onClearLocalSession,
  room,
  spRoom,
  setMode,
  setView,
  onLeaveOnlineRoom,
  onOpenTutorial,
  onOpenMatchHistory,
  spName,
  setSpName,
  spAvatar,
  setSpAvatar,
  spDifficulty,
  setSpDifficulty,
  onSpRoomChange,
  localNames,
  setLocalNames,
  localAvatars,
  setLocalAvatars,
  localTimerSeconds,
  setLocalTimerSeconds,
  onStartLocalMatch,
  myPlayerId,
  onCreateRoom,
  onJoinRoom,
  onStartOnlineGame,
  onAddBot,
  onRemoveBot,
  activeOfflineRoomState,
  currentOfflinePlayer,
  onPlayOfflineCard,
  onPassOfflineSolitaire,
  onAdvanceOfflineRound,
  onToggleOfflineShield,
  onDismissOfflineShield,
  onInitOfflineGame,
  executeOnlineCardPlay,
  handleOnlinePassSolitaire,
  handleNextOnlineRound,
  isEmojiModalOpen,
  onToggleEmojiModal,
}) => {
  const isGameView = view === 'GAME' || view === 'SINGLE_PLAYER_GAME';

  return (
    <main
      className={cn(
        'flex-1 relative flex flex-col min-h-0',
        isGameView ? 'overflow-hidden' : 'overflow-y-auto'
      )}
    >
      {/* SCREEN 1: HUB */}
      {view === 'HUB' && (
        <HubView
          pwaPrompt={pwaPrompt}
          isPwaInstalled={isPwaInstalled}
          onInstallPwa={onInstallPwa}
          offlineState={offlineState}
          onResumeLocalMatch={onResumeLocalMatch}
          onClearLocalSession={onClearLocalSession}
          room={room}
          onSelectMode={(m, v) => {
            setMode(m);
            setView(v);
          }}
          onLeaveOnlineRoom={onLeaveOnlineRoom}
          onOpenTutorial={onOpenTutorial}
          onOpenMatchHistory={onOpenMatchHistory}
        />
      )}

      {/* SCREEN 1B: SINGLE PLAYER SETUP */}
      {view === 'SINGLE_PLAYER_SETUP' && (
        <SinglePlayerSetupView
          spName={spName}
          setSpName={setSpName}
          spAvatar={spAvatar}
          setSpAvatar={setSpAvatar}
          spDifficulty={spDifficulty}
          setSpDifficulty={setSpDifficulty}
          onBack={() => setView('HUB')}
          onStartMatch={(m, v) => {
            setMode(m);
            setView(v);
          }}
        />
      )}

      {/* SCREEN 1C: SINGLE PLAYER GAME BOARD */}
      {view === 'SINGLE_PLAYER_GAME' && (
        <SinglePlayerBoard
          playerName={spName}
          playerAvatar={spAvatar}
          difficulty={spDifficulty}
          onExitToMenu={() => setView('HUB')}
          onRoomChange={onSpRoomChange}
          isEmojiModalOpen={isEmojiModalOpen}
          onToggleEmojiModal={onToggleEmojiModal}
        />
      )}

      {/* SCREEN 2: OFFLINE SETUP */}
      {view === 'OFFLINE_SETUP' && (
        <OfflineSetupView
          localNames={localNames}
          setLocalNames={setLocalNames}
          localAvatars={localAvatars}
          setLocalAvatars={setLocalAvatars}
          localTimerSeconds={localTimerSeconds}
          setLocalTimerSeconds={setLocalTimerSeconds}
          onBack={() => setView('HUB')}
          onStartLocalMatch={onStartLocalMatch}
        />
      )}

      {/* SCREEN 3: ONLINE MULTIPLAYER LOBBY */}
      {view === 'ONLINE_LOBBY' && (
        <div className="relative">
          <div className="absolute top-4 left-4 z-20">
            <button
              id="lobby-back-hub-btn"
              onClick={() => setView('HUB')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
          <Lobby
            room={room}
            myPlayerId={myPlayerId}
            onCreateRoom={onCreateRoom}
            onJoinRoom={onJoinRoom}
            onStartGame={onStartOnlineGame}
            onAddBot={onAddBot}
            onRemoveBot={onRemoveBot}
          />
        </div>
      )}

      {/* SCREEN 4: GAME BOARD (ONLINE OR OFFLINE PASS & PLAY) */}
      {view === 'GAME' && (
        <>
          {mode === 'OFFLINE' ? (
            activeOfflineRoomState ? (
              <>
                <GameBoard
                  room={activeOfflineRoomState}
                  myPlayerId={currentOfflinePlayer?.id || 'local-player-0'}
                  onPlayCard={onPlayOfflineCard}
                  onPassSolitaire={onPassOfflineSolitaire}
                  onNextRound={onAdvanceOfflineRound}
                  onToggleHideHand={onToggleOfflineShield}
                  isEmojiModalOpen={isEmojiModalOpen}
                  onToggleEmojiModal={onToggleEmojiModal}
                />

                {/* Pass Shield Privacy Overlay */}
                {currentOfflinePlayer && (
                  <PassShield
                    isOpen={
                      offlineState?.status === 'PASS_SHIELD' ||
                      offlineState?.manualShieldActive === true
                    }
                    nextPlayer={currentOfflinePlayer}
                    currentRound={offlineState?.currentRound || 1}
                    lastActionMessage={offlineState?.lastActionMessage}
                    onReveal={onDismissOfflineShield}
                  />
                )}

                {/* Game Over Overlay */}
                {activeOfflineRoomState.status === 'GAME_OVER' && (
                  <GameOverOverlay
                    room={activeOfflineRoomState}
                    myPlayerId={currentOfflinePlayer?.id}
                    onPlayAgain={onInitOfflineGame}
                    onExitToMenu={() => setView('HUB')}
                  />
                )}
              </>
            ) : (
              <div className="p-8 text-center text-slate-400">No local game active</div>
            )
          ) : room ? (
            <>
              <GameBoard
                room={room}
                myPlayerId={myPlayerId}
                onPlayCard={async (card) => {
                  const me = room.players.find((p) => p.id === myPlayerId);
                  if (me) await executeOnlineCardPlay(room, me, card);
                }}
                onPassSolitaire={() => {
                  const me = room.players.find((p) => p.id === myPlayerId);
                  if (me) handleOnlinePassSolitaire(room, me);
                }}
                onNextRound={handleNextOnlineRound}
                isEmojiModalOpen={isEmojiModalOpen}
                onToggleEmojiModal={onToggleEmojiModal}
              />

              {/* Game Over Overlay */}
              {room.status === 'GAME_OVER' && (
                <GameOverOverlay
                  room={room}
                  myPlayerId={myPlayerId}
                  onPlayAgain={onStartOnlineGame}
                  onExitToMenu={() => setView('HUB')}
                />
              )}
            </>
          ) : (
            <div className="p-8 text-center text-slate-400">No online room active</div>
          )}
        </>
      )}
    </main>
  );
};
