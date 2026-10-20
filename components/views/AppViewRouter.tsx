'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HubView } from '@/components/views/HubView';
import { SinglePlayerSetupView } from '@/components/views/SinglePlayerSetupView';
import { SinglePlayerBoard } from '@/components/SinglePlayerBoard';
import { OfflineSetupView } from '@/components/views/OfflineSetupView';
import { GameBoard } from '@/components/GameBoard';
import { PassShield } from '@/components/PassShield';
import { GameOverOverlay } from '@/components/game/GameOverOverlay';
import { RoomState, Player, Card, BotDifficulty } from '@/lib/types';
import { OfflineGameState } from '@/lib/offline-engine';

export type AppView =
  | 'HUB'
  | 'SINGLE_PLAYER_SETUP'
  | 'SINGLE_PLAYER_GAME'
  | 'OFFLINE_SETUP'
  | 'GAME';

export type GameMode = 'SINGLE_PLAYER' | 'OFFLINE';

interface AppViewRouterProps {
  view: AppView;
  mode: GameMode;
  pwaPrompt: any;
  isPwaInstalled: boolean;
  onInstallPwa: () => void;
  offlineState: OfflineGameState | null;
  onResumeLocalMatch: () => void;
  onClearLocalSession: () => void;
  spRoom: RoomState | null;
  setMode: (m: GameMode) => void;
  setView: (v: AppView) => void;
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
  activeOfflineRoomState: RoomState | null;
  currentOfflinePlayer: Player | undefined;
  onPlayOfflineCard: (card: Card) => void;
  onPassOfflineSolitaire: () => void;
  onAdvanceOfflineRound: () => void;
  onToggleOfflineShield: () => void;
  onDismissOfflineShield: () => void;
  onInitOfflineGame: () => void;
  isEmojiModalOpen?: boolean;
  onToggleEmojiModal?: () => void;
}

export const AppViewRouter: React.FC<AppViewRouterProps> = ({
  view,
  mode: _mode,
  pwaPrompt,
  isPwaInstalled,
  onInstallPwa,
  offlineState,
  onResumeLocalMatch,
  onClearLocalSession,
  spRoom: _spRoom,
  setMode,
  setView,
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
  activeOfflineRoomState,
  currentOfflinePlayer,
  onPlayOfflineCard,
  onPassOfflineSolitaire,
  onAdvanceOfflineRound,
  onToggleOfflineShield,
  onDismissOfflineShield,
  onInitOfflineGame,
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
          onSelectMode={(m, v) => {
            setMode(m);
            setView(v);
          }}
          onOpenTutorial={onOpenTutorial}
          onOpenMatchHistory={onOpenMatchHistory}
        />
      )}

      {/* SCREEN 2: SINGLE PLAYER SETUP */}
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

      {/* SCREEN 3: SINGLE PLAYER GAME BOARD */}
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

      {/* SCREEN 4: OFFLINE SETUP (PASS & PLAY) */}
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

      {/* SCREEN 5: GAME BOARD (OFFLINE PASS & PLAY) */}
      {view === 'GAME' && (
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
      )}
    </main>
  );
};
