'use client';

import React, { useState, useEffect, useReducer, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { OrientationPrompt } from '@/components/OrientationPrompt';
import { ChatReactions } from '@/components/ChatReactions';
import { RoomState, ChatMessage, FloatingReaction } from '@/lib/types';
import { commentatorEngine, CommentatorStateSnapshot } from '@/lib/commentator-engine';
import { BotDifficulty } from '@/lib/bot-engine';
import { useOnlineRoomSession } from '@/hooks/useOnlineRoomSession';
import { useOfflineGameSession } from '@/hooks/useOfflineGameSession';
import { AppViewRouter, AppView, GameMode } from '@/components/views/AppViewRouter';
import {
  tutorialEngineReducer,
  createInitialTutorialEngineState,
} from '@/lib/tutorial-engine';
import { GlobalModalOrchestrator } from '@/components/views/GlobalModalOrchestrator';

export default function Home() {
  const [view, setView] = useState<AppView>('HUB');
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<GameMode>('ONLINE');

  // Single Player Setup State
  const [spName, setSpName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fun_playerName') || 'Player 1';
    }
    return 'Player 1';
  });
  const [spAvatar, setSpAvatar] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fun_playerAvatar') || '🖕';
    }
    return '🖕';
  });
  const [spDifficulty, setSpDifficulty] = useState<BotDifficulty>('MEDIUM');
  const [spRoom, setSpRoom] = useState<RoomState | null>(null);

  // Online Room State & Id
  const [myPlayerId, setMyPlayerId] = useState<string>('player_guest');

  // Modals
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isMatchHistoryOpen, setIsMatchHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);

  // Sessions
  const offlineSession = useOfflineGameSession(mode, setMode, setView);
  const { offlineState } = offlineSession;

  const {
    room,
    loading,
    executeOnlineCardPlay,
    handleOnlinePassSolitaire,
    handleCreateRoom,
    handleJoinRoom,
    handleAddBot,
    handleRemoveBot,
    handleStartOnlineGame,
    handleNextOnlineRound,
    handleSendOnlineMessage,
    handleSendOnlineReaction,
    leaveOnlineRoom,
  } = useOnlineRoomSession(myPlayerId, mode, () => setIsScoreboardOpen(true));

  // Tutorial Engine State
  const [tutorialState, tutorialDispatch] = useReducer(
    tutorialEngineReducer,
    null,
    createInitialTutorialEngineState
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);

      let pid = localStorage.getItem('fun_playerId');
      if (!pid) {
        pid = 'player_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('fun_playerId', pid);
      }
      setMyPlayerId(pid);

      const hasCompletedTutorial = localStorage.getItem('fun_tutorial_completed');
      if (!hasCompletedTutorial) {
        tutorialDispatch({ type: 'OPEN_TUTORIAL' });
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Commentator State Observers
  const prevRoomRef = useRef<CommentatorStateSnapshot | null>(null);
  const prevOfflineRef = useRef<CommentatorStateSnapshot | null>(null);

  useEffect(() => {
    if (mode === 'ONLINE' && room) {
      const currSnapshot: CommentatorStateSnapshot = {
        status: room.status,
        currentRound: room.currentRound,
        players: room.players,
        lastCompletedTrick: room.lastCompletedTrick,
        totalScores: room.totalScores,
        solitairePlacements: room.solitairePlacements || [],
      };
      commentatorEngine.observeGameState(prevRoomRef.current, currSnapshot);
      prevRoomRef.current = currSnapshot;
    }
  }, [mode, room]);

  useEffect(() => {
    if ((mode === 'OFFLINE' || mode === 'SINGLE_PLAYER') && offlineState) {
      const currSnapshot: CommentatorStateSnapshot = {
        status: offlineState.status,
        currentRound: offlineState.currentRound,
        players: offlineState.players,
        lastCompletedTrick: offlineState.lastCompletedTrick,
        totalScores: offlineState.totalScores,
        solitairePlacements: offlineState.solitairePlacements || [],
      };
      commentatorEngine.observeGameState(prevOfflineRef.current, currSnapshot);
      prevOfflineRef.current = currSnapshot;
    }
  }, [mode, offlineState]);

  // Local Form state
  const [localNames, setLocalNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [localAvatars, setLocalAvatars] = useState<string[]>(['👑', '🦊', '⚡', '🐉']);
  const [localTimerSeconds, setLocalTimerSeconds] = useState<number>(40);

  // Local Chat & Floating Reactions state
  const [localChatMessages, setLocalChatMessages] = useState<ChatMessage[]>([]);
  const [localReactions, setLocalReactions] = useState<FloatingReaction[]>([]);

  const handleSendReactionEmoji = (emoji: string) => {
    if (mode === 'ONLINE') {
      handleSendOnlineReaction(emoji);
    } else {
      const newReaction: FloatingReaction = {
        id: Math.random().toString(),
        playerId: myPlayerId || 'local_user',
        emoji,
        timestamp: Date.now(),
      };
      setLocalReactions((prev) => [...prev.slice(-10), newReaction]);
    }
  };

  const handleSendReactionOrMessage = (text: string) => {
    if (mode === 'ONLINE') {
      handleSendOnlineMessage(text);
    } else {
      const newMsg: ChatMessage = {
        id: Math.random().toString(),
        playerId: myPlayerId || 'local_user',
        playerName: mode === 'SINGLE_PLAYER' ? (spName || 'You') : 'Player',
        text,
        timestamp: Date.now(),
      };
      setLocalChatMessages((prev) => [...prev.slice(-20), newMsg]);
    }
  };

  // PWA Prompt
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPwaPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setPwaPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    pwaPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        setIsPwaInstalled(true);
      }
      setPwaPrompt(null);
    });
  };

  const activeOfflineRoomState = React.useMemo<RoomState | null>(() => {
    if (!offlineState) return null;
    return {
      roomCode: 'LOCAL',
      createdAt: 0,
      status: offlineState.status === 'PASS_SHIELD' ? 'PLAYER_TURN' : (offlineState.status as any),
      currentRound: offlineState.currentRound,
      hostId: offlineState.players[0]?.id || 'local-host',
      players: offlineState.players,
      turnSeatIndex: offlineState.activeSeatIndex,
      turnDeadline: offlineState.turnDeadline || 0,
      turnTimerSeconds: offlineState.turnTimerSeconds || 40,
      leadSuit: offlineState.leadSuit,
      currentTrick: offlineState.currentTrick,
      trickLeaderSeat: offlineState.trickLeaderSeat,
      lastCompletedTrick: offlineState.lastCompletedTrick,
      scores: offlineState.scores,
      totalScores: offlineState.totalScores,
      hands: offlineState.hands,
      tricksTakenCount: {},
      solitaireBoard: offlineState.solitaireBoard,
      solitairePlacements: offlineState.solitairePlacements,
      solitairePassedSeats: offlineState.solitairePassedSeats,
      chatMessages: [],
      reactions: [],
      lastActionMessage: offlineState.lastActionMessage,
    };
  }, [offlineState]);

  const currentOfflinePlayer = offlineState?.players.find(
    (p) => p.seatIndex === offlineState.activeSeatIndex
  );

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#050705] text-white flex flex-col items-center justify-center p-4 space-y-3 select-none">
        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-2xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-bounce">
          🖕
        </div>
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          Loading F.U.N. Match Engine...
        </div>
      </div>
    );
  }

  const isGameView = view === 'GAME' || view === 'SINGLE_PLAYER_GAME';
  const activeRoom = mode === 'OFFLINE' ? activeOfflineRoomState : mode === 'SINGLE_PLAYER' ? spRoom : room;

  return (
    <div
      className={cn(
        'bg-[#050705] text-slate-100 flex flex-col justify-between',
        isGameView
          ? 'h-screen h-[100dvh] overflow-hidden'
          : 'min-h-screen overflow-x-hidden overflow-y-auto'
      )}
    >
      <Header
        room={activeRoom || undefined}
        isOffline={mode === 'OFFLINE'}
        isMultiplayer={mode === 'ONLINE' && (view === 'ONLINE_LOBBY' || (view === 'GAME' && mode === 'ONLINE'))}
        currentView={view}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenScoreboard={() => setIsScoreboardOpen(true)}
        onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHideHand={() => offlineSession.toggleOfflineShield()}
      />

      <OrientationPrompt />

      <AppViewRouter
        view={view}
        mode={mode}
        pwaPrompt={pwaPrompt}
        isPwaInstalled={isPwaInstalled}
        onInstallPwa={handleInstallPwa}
        offlineState={offlineState}
        onResumeLocalMatch={offlineSession.handleResumeLocalMatch}
        onClearLocalSession={offlineSession.handleClearLocalSession}
        room={room}
        spRoom={spRoom}
        setMode={setMode}
        setView={setView}
        onLeaveOnlineRoom={leaveOnlineRoom}
        onOpenTutorial={() => tutorialDispatch({ type: 'OPEN_TUTORIAL' })}
        onOpenMatchHistory={() => setIsMatchHistoryOpen(true)}
        spName={spName}
        setSpName={setSpName}
        spAvatar={spAvatar}
        setSpAvatar={setSpAvatar}
        spDifficulty={spDifficulty}
        setSpDifficulty={setSpDifficulty}
        onSpRoomChange={setSpRoom}
        localNames={localNames}
        setLocalNames={setLocalNames}
        localAvatars={localAvatars}
        setLocalAvatars={setLocalAvatars}
        localTimerSeconds={localTimerSeconds}
        setLocalTimerSeconds={setLocalTimerSeconds}
        onStartLocalMatch={() => offlineSession.handleStartLocalMatch(localNames, localAvatars, localTimerSeconds)}
        myPlayerId={myPlayerId}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartOnlineGame={handleStartOnlineGame}
        onAddBot={handleAddBot}
        onRemoveBot={handleRemoveBot}
        activeOfflineRoomState={activeOfflineRoomState}
        currentOfflinePlayer={currentOfflinePlayer}
        onPlayOfflineCard={(card) => offlineSession.playOfflineCard(card, currentOfflinePlayer)}
        onPassOfflineSolitaire={() => offlineSession.passOfflineSolitaire(currentOfflinePlayer)}
        onAdvanceOfflineRound={offlineSession.advanceOfflineRound}
        onToggleOfflineShield={offlineSession.toggleOfflineShield}
        onDismissOfflineShield={offlineSession.dismissOfflineShield}
        onInitOfflineGame={() => offlineSession.handleStartLocalMatch(localNames, localAvatars, localTimerSeconds)}
        executeOnlineCardPlay={executeOnlineCardPlay}
        handleOnlinePassSolitaire={handleOnlinePassSolitaire}
        handleNextOnlineRound={handleNextOnlineRound}
        isEmojiModalOpen={isEmojiModalOpen}
        onToggleEmojiModal={() => setIsEmojiModalOpen(!isEmojiModalOpen)}
      />

      {isGameView && (
        <ChatReactions
          messages={mode === 'ONLINE' && room ? room.chatMessages || [] : localChatMessages}
          reactions={mode === 'ONLINE' && room ? room.reactions || [] : localReactions}
          onSendMessage={handleSendReactionOrMessage}
          onSendReaction={handleSendReactionEmoji}
          isOpen={isEmojiModalOpen}
          onToggle={() => setIsEmojiModalOpen(!isEmojiModalOpen)}
        />
      )}

      <GlobalModalOrchestrator
        isRulesOpen={isRulesOpen}
        onCloseRules={() => setIsRulesOpen(false)}
        isScoreboardOpen={isScoreboardOpen}
        onCloseScoreboard={() => setIsScoreboardOpen(false)}
        isMatchHistoryOpen={isMatchHistoryOpen}
        onCloseMatchHistory={() => setIsMatchHistoryOpen(false)}
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={() => setIsSettingsOpen(false)}
        activeRoomState={activeRoom}
        myPlayerId={
          mode === 'OFFLINE'
            ? currentOfflinePlayer?.id || 'local-player-0'
            : mode === 'SINGLE_PLAYER'
            ? 'human_player'
            : myPlayerId
        }
        tutorialState={tutorialState}
        tutorialDispatch={tutorialDispatch}
      />
    </div>
  );
}
