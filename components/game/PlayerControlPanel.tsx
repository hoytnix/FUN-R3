import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomState, Card, Player } from '@/lib/types';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { formatCardName } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Clock, Shield, CheckCircle2, XCircle } from 'lucide-react';

interface PlayerControlPanelProps {
  room: RoomState;
  bottomPlayer: Player | undefined;
  isMyTurn: boolean;
  timeLeft: number;
  myHand: Card[];
  playableCards: Card[];
  cardToConfirm: Card | null;
  onCardClick: (card: Card) => void;
  onConfirmPlayCard: () => void;
  onCancelPlayCard: () => void;
  onPassSolitaire: () => void;
  onNextRound: () => void;
  onToggleHideHand?: () => void;
  isEmojiModalOpen?: boolean;
  onToggleEmojiModal?: () => void;
}

export const PlayerControlPanel: React.FC<PlayerControlPanelProps> = ({
  room,
  bottomPlayer,
  isMyTurn,
  timeLeft,
  myHand,
  playableCards,
  cardToConfirm,
  onCardClick,
  onConfirmPlayCard,
  onCancelPlayCard,
  onPassSolitaire,
  onNextRound,
  onToggleHideHand,
  isEmojiModalOpen,
  onToggleEmojiModal,
}) => {
  return (
    <div className="z-30 w-full flex flex-col items-center shrink-0 space-y-1 xs:space-y-1.5 sm:space-y-2 pb-1 sm:pb-2">
      {/* Turn Banner / Status Indicator */}
      <div className="flex items-center justify-between w-full max-w-2xl px-2 sm:px-4 text-xs font-bold">
        <div className="flex items-center space-x-1.5">
          {bottomPlayer && (
            <div
              className={cn(
                'flex items-center space-x-1.5 px-2.5 py-1 rounded-full border bg-black/80 backdrop-blur-md',
                isMyTurn
                  ? 'border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                  : 'border-white/10 text-slate-400'
              )}
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] sm:text-xs">
                {bottomPlayer.avatar}
              </div>
              <span className="font-bold text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[120px]">
                {bottomPlayer.name}
              </span>
              <span className="text-[10px] sm:text-xs text-amber-400 font-mono">
                {room.totalScores?.[bottomPlayer.id] ?? 0}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onToggleEmojiModal && (
            <button
              id="emoticon-laugh-toggle-btn"
              onClick={onToggleEmojiModal}
              className={cn(
                'flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[10px] sm:text-xs font-bold transition-all cursor-pointer',
                isEmojiModalOpen
                  ? 'border-amber-400 bg-amber-950/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'border-amber-500/60 bg-black/80 hover:bg-amber-950/40 text-amber-400'
              )}
              title="Emoticons & Voice Taunts"
            >
              <span className="text-sm leading-none">🤣</span>
              <span className="hidden xs:inline">Taunts</span>
            </button>
          )}

          {isMyTurn && (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-green-500/20 border border-green-500/60 rounded-full text-[10px] sm:text-xs font-bold text-green-300 animate-pulse">
              <Clock className="w-3.5 h-3.5 text-green-400" />
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Pass Button for Round 4 Solitaire when no legal move */}
          {isMyTurn && room.currentRound === 4 && playableCards.length === 0 && (
            <button
              id="pass-solitaire-btn"
              onClick={onPassSolitaire}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)] transition-all uppercase tracking-wider animate-bounce cursor-pointer"
            >
              NO MOVES — PASS TURN ⏩
            </button>
          )}

          {/* Manual Pass Shield Hide Hand Toggle button */}
          {onToggleHideHand && (
            <button
              id="toggle-hide-hand-btn"
              onClick={onToggleHideHand}
              className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Privacy Shield</span>
            </button>
          )}
        </div>
      </div>

      {/* Hand Cards Fan Display */}
      <div className="relative w-full max-w-3xl flex items-center justify-center min-h-[90px] xs:min-h-[100px] sm:min-h-[120px]">
        {myHand.length === 0 ? (
          <div className="text-center p-3 bg-black/60 border border-white/10 rounded-2xl text-slate-400 text-xs font-mono">
            {room.currentRound === 4 ? '🎉 Hand Cleared! Solitaire finished!' : 'No cards in hand.'}
          </div>
        ) : (
          <div className="w-full max-w-full overflow-x-auto touch-pan-x overscroll-x-contain py-2 px-1 no-scrollbar flex items-center justify-start sm:justify-center">
            <div className="inline-flex flex-nowrap gap-2 -space-x-3.5 xs:-space-x-4 sm:-space-x-6 hover:-space-x-2 transition-all duration-300 min-w-max items-center">
              {myHand.map((card, idx) => {
                const isPlayable = isMyTurn && playableCards.some((c) => c.id === card.id);
                const isSelected = cardToConfirm?.id === card.id;

                return (
                  <motion.div
                    key={card.id}
                    whileHover={{ y: -12, scale: 1.05 }}
                    onClick={() => onCardClick(card)}
                    className={cn(
                      'transition-all duration-200 cursor-pointer relative flex-shrink-0 select-none',
                      isSelected && '-translate-y-4 scale-105 z-30',
                      !isPlayable && isMyTurn && 'opacity-40 grayscale cursor-not-allowed'
                    )}
                  >
                    <PlayingCard
                      card={card}
                      size="md"
                      className={cn(
                        'shadow-[0_8px_20px_rgba(0,0,0,0.6)] border',
                        isPlayable && isMyTurn
                          ? 'border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]'
                          : isSelected
                          ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                          : 'border-white/20'
                      )}
                    />
                    {isPlayable && isMyTurn && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-black animate-ping" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Round End Next Round Control */}
      {room.status === 'ROUND_END' && (
        <div className="w-full flex justify-center py-2 z-40">
          <button
            id="panel-next-round-btn"
            onClick={onNextRound}
            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all uppercase tracking-wider animate-bounce cursor-pointer flex items-center space-x-2"
          >
            <span>PROCEED TO ROUND {Math.min(4, room.currentRound + 1)}</span>
            <span>🚀</span>
          </button>
        </div>
      )}

      {/* Confirmation Dialog Sheet */}
      <AnimatePresence>
        {cardToConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-14 sm:bottom-16 left-1/2 -translate-x-1/2 z-50 bg-black/95 border-2 border-amber-500/80 p-3 sm:p-4 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.5)] backdrop-blur-xl flex items-center space-x-3 sm:space-x-4 max-w-md w-[90vw]"
          >
            <div className="shrink-0">
              <PlayingCard card={cardToConfirm} size="sm" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                Confirm Play
              </div>
              <div className="text-sm font-bold text-white truncate">
                Play {formatCardName(cardToConfirm)}?
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                id="cancel-play-card-btn"
                onClick={onCancelPlayCard}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5 text-red-400" />
              </button>
              <button
                id="confirm-play-card-btn"
                onClick={onConfirmPlayCard}
                className="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white font-black text-xs rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.5)] flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
