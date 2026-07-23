'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomState, Card, Player } from '@/lib/types';
import { soundEngine } from '@/lib/audio';
import { getPlayableCards } from '@/lib/game-engine';
import { OnlineTableArea } from '@/components/game/OnlineTableArea';
import { PlayerControlPanel } from '@/components/game/PlayerControlPanel';
import { OnlineScorePanel } from '@/components/game/OnlineScorePanel';

interface GameBoardProps {
  room: RoomState;
  myPlayerId: string;
  onPlayCard: (card: Card) => void;
  onPassSolitaire: () => void;
  onNextRound: () => void;
  onToggleHideHand?: () => void;
  isEmojiModalOpen?: boolean;
  onToggleEmojiModal?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  room,
  myPlayerId,
  onPlayCard,
  onPassSolitaire,
  onNextRound,
  onToggleHideHand,
  isEmojiModalOpen,
  onToggleEmojiModal,
}) => {
  const [cardToConfirm, setCardToConfirm] = useState<Card | null>(null);

  const maxTimerSeconds =
    room.turnTimerSeconds ||
    (room.difficulty === 'EASY' ? 60 : room.difficulty === 'HARD' ? 20 : 40);

  const [timeLeft, setTimeLeft] = useState(maxTimerSeconds);

  const me = room.players.find((p) => p.id === myPlayerId);
  const mySeatIndex = me?.seatIndex ?? 0;

  const isMyTurn = room.turnSeatIndex === mySeatIndex && room.status === 'PLAYER_TURN';
  const myHand = room.hands?.[myPlayerId] || [];

  const [showTrickToast, setShowTrickToast] = useState(false);

  useEffect(() => {
    if (!room.lastCompletedTrick) {
      return;
    }

    const showTimer = setTimeout(() => {
      setShowTrickToast(true);
    }, 0);

    const hideTimer = setTimeout(() => {
      setShowTrickToast(false);
    }, 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [room.lastCompletedTrick]);

  // Playable cards validator
  const playableCards = getPlayableCards(
    myHand,
    room.leadSuit,
    room.currentRound,
    room.solitaireBoard
  );

  // Play audio when turn arrives
  useEffect(() => {
    if (isMyTurn) {
      soundEngine.playYourTurn();
    }
  }, [isMyTurn]);

  // Turn Countdown Timer Sync
  useEffect(() => {
    if (!room.turnDeadline) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((room.turnDeadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 500);

    return () => clearInterval(interval);
  }, [room.turnDeadline]);

  // Auto-select a random legal option when turn time expires
  const hasAutoPlayedRef = useRef<string | null>(null);

  useEffect(() => {
    hasAutoPlayedRef.current = null;
    const t = setTimeout(() => {
      setCardToConfirm(null);
    }, 0);
    return () => clearTimeout(t);
  }, [room.turnDeadline, room.turnSeatIndex]);

  useEffect(() => {
    if (!isMyTurn || room.status !== 'PLAYER_TURN' || timeLeft > 0 || !room.turnDeadline) return;

    const turnKey = `${room.turnSeatIndex}_${room.turnDeadline}`;
    if (hasAutoPlayedRef.current === turnKey) return;
    hasAutoPlayedRef.current = turnKey;

    setCardToConfirm(null);

    if (room.currentRound === 4 && playableCards.length === 0) {
      onPassSolitaire();
    } else if (playableCards.length > 0) {
      const randomIndex = Math.floor(Math.random() * playableCards.length);
      const randomCard = playableCards[randomIndex];
      soundEngine.playCardSnap();
      onPlayCard(randomCard);
    }
  }, [isMyTurn, room.status, timeLeft, room.turnDeadline, room.turnSeatIndex, room.currentRound, playableCards, onPassSolitaire, onPlayCard]);

  const handleCardClick = (card: Card) => {
    if (!isMyTurn) return;

    const isLegal = playableCards.some((c) => c.id === card.id);
    if (!isLegal) return;

    soundEngine.playClick();
    setCardToConfirm(card);
  };

  const handleConfirmPlayCard = () => {
    if (!cardToConfirm) return;
    soundEngine.playCardSnap();
    onPlayCard(cardToConfirm);
    setCardToConfirm(null);
  };

  const handleCancelPlayCard = () => {
    soundEngine.playClick();
    setCardToConfirm(null);
  };

  return (
    <div className="relative w-full flex-1 min-h-0 h-full flex flex-col justify-between p-1 sm:p-3 select-none overflow-hidden bg-[#050705] bg-[radial-gradient(circle_at_50%_50%,_#1a2e1a_0%,_#050705_80%)] text-slate-100">
      {/* Background Dot Pattern */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top Bar Status Info */}
      <OnlineScorePanel room={room} />

      {/* Central Table Felt Container */}
      <OnlineTableArea
        room={room}
        mySeatIndex={mySeatIndex}
        timeLeft={timeLeft}
        showTrickToast={showTrickToast}
      />

      {/* Bottom Player Hand & Action Controls */}
      <PlayerControlPanel
        room={room}
        bottomPlayer={me}
        isMyTurn={isMyTurn}
        timeLeft={timeLeft}
        myHand={myHand}
        playableCards={playableCards}
        cardToConfirm={cardToConfirm}
        onCardClick={handleCardClick}
        onConfirmPlayCard={handleConfirmPlayCard}
        onCancelPlayCard={handleCancelPlayCard}
        onPassSolitaire={onPassSolitaire}
        onNextRound={onNextRound}
        onToggleHideHand={onToggleHideHand}
        isEmojiModalOpen={isEmojiModalOpen}
        onToggleEmojiModal={onToggleEmojiModal}
      />

      {/* Round Completion Modal Overlay */}
      <AnimatePresence>
        {room.status === 'ROUND_END' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 max-w-md w-full text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] space-y-4">
              <div className="text-4xl animate-bounce">🏁</div>
              <h2 className="text-2xl font-black text-amber-400 uppercase tracking-tight">
                Round {room.currentRound} Complete!
              </h2>
              <p className="text-xs text-slate-300 font-mono">
                {room.currentRound === 1 && 'Hearts completed. Penalty points tallied.'}
                {room.currentRound === 2 && 'Royal Suite completed. J/Q/K penalties tallied.'}
                {room.currentRound === 3 && 'Queen Sudden Death completed.'}
                {room.currentRound === 4 && 'Solitaire Race finished!'}
              </p>

              {/* Current Standings */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-3 space-y-2 text-left">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-white/10 pb-1">
                  Current Standings
                </div>
                {room.players.map((p) => {
                  const score = room.totalScores?.[p.id] ?? 0;
                  return (
                    <div key={p.id} className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center space-x-1.5 text-white">
                        <span>{p.avatar}</span>
                        <span>{p.name} {p.id === myPlayerId ? '(You)' : ''}</span>
                      </span>
                      <span className="font-mono text-amber-400">{score} pts</span>
                    </div>
                  );
                })}
              </div>

              <button
                id="start-next-round-btn"
                onClick={onNextRound}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.6)] uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
              >
                Start Round {Math.min(4, room.currentRound + 1)} 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
