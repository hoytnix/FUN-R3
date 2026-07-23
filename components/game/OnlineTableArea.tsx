import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomState, Card, Player, TrickCard } from '@/lib/types';
import { PlayingCard } from '@/components/ui/PlayingCard';
import { SolitaireBoardView } from '@/components/game/SolitaireBoardView';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnlineTableAreaProps {
  room: RoomState;
  mySeatIndex: number;
  timeLeft: number;
  showTrickToast: boolean;
}

export const OnlineTableArea: React.FC<OnlineTableAreaProps> = ({
  room,
  mySeatIndex,
  timeLeft,
  showTrickToast,
}) => {
  const getRelativePlayer = (offset: number): Player | undefined => {
    const targetSeatIndex = (mySeatIndex + offset) % 4;
    return room.players.find((p) => p.seatIndex === targetSeatIndex);
  };

  const leftPlayer = getRelativePlayer(1);
  const topPlayer = getRelativePlayer(2);
  const rightPlayer = getRelativePlayer(3);

  const renderTurnBadge = (seatIndex?: number) => {
    if (seatIndex === undefined || room.turnSeatIndex !== seatIndex) return null;

    return (
      <div className="flex items-center space-x-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/60 rounded-full text-[10px] font-mono font-bold text-amber-300 animate-pulse">
        <Clock className="w-3 h-3 text-amber-400" />
        <span>{timeLeft}s</span>
      </div>
    );
  };

  return (
    <div className="relative flex-1 my-0.5 sm:my-1 flex items-center justify-center min-h-0 w-full overflow-hidden">
      {/* Oval Felt Table Mat Ring */}
      <div className="relative w-[92vw] max-w-[440px] sm:w-[460px] md:w-[540px] short:w-[88vw] short:max-w-[500px] h-[34vh] min-h-[200px] max-h-[350px] sm:h-[250px] md:h-[290px] short:h-[48vh] short:min-h-[140px] short:max-h-[195px] border-[4px] sm:border-[8px] md:border-[12px] short:border-[3px] border-white/5 rounded-[70px] xs:rounded-[90px] sm:rounded-[140px] short:rounded-[55px] flex items-center justify-center shadow-2xl bg-black/20 my-auto">
        
        {/* --- NORTH PLAYER (TOP) --- */}
        {topPlayer && (
          <div className="absolute -top-3.5 xs:-top-4 sm:-top-7 short:-top-3 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-0.5 z-30">
            <div
              className={cn(
                'flex items-center space-x-1 bg-black/80 border px-1.5 py-0.5 sm:px-3 sm:py-1.5 short:px-1 short:py-0.5 rounded-full shadow-lg backdrop-blur-md transition-all',
                room.turnSeatIndex === topPlayer.seatIndex
                  ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'border-white/10'
              )}
            >
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 short:w-4.5 short:h-4.5 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] xs:text-xs sm:text-base short:text-[9px]">
                {topPlayer.avatar}
              </div>
              <div className="text-left leading-tight">
                <div className="text-[9px] xs:text-[10px] sm:text-xs short:text-[8px] font-bold text-white flex items-center space-x-0.5">
                  <span className="truncate max-w-[45px] xs:max-w-[65px] sm:max-w-[100px] short:max-w-[40px]">{topPlayer.name}</span>
                  {topPlayer.isHost && <span>👑</span>}
                </div>
                <div className="text-[7px] xs:text-[8px] sm:text-[10px] short:text-[7px] text-slate-400">
                  Pts: <span className="text-amber-400 font-bold">{room.totalScores?.[topPlayer.id] ?? 0}</span>
                </div>
              </div>
              {renderTurnBadge(topPlayer.seatIndex)}
            </div>

            <div className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 short:px-1 short:py-0 bg-slate-900/90 border border-white/10 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] short:text-[6.5px] font-mono text-slate-300 shadow flex items-center space-x-0.5">
              <span>🂠</span>
              <span>{room.hands?.[topPlayer.id]?.length || 0}</span>
            </div>
          </div>
        )}

        {/* --- WEST PLAYER (LEFT) --- */}
        {leftPlayer && (
          <div className="absolute -left-1 xs:-left-3 sm:-left-8 short:-left-1 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-0.5 z-30">
            <div
              className={cn(
                'flex flex-col items-center bg-black/80 border p-1 sm:p-2 short:p-0.5 rounded-lg sm:rounded-2xl shadow-lg backdrop-blur-md space-y-0.5 transition-all',
                room.turnSeatIndex === leftPlayer.seatIndex
                  ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'border-white/10'
              )}
            >
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 short:w-4.5 short:h-4.5 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] xs:text-xs sm:text-base short:text-[9px]">
                {leftPlayer.avatar}
              </div>
              <span className="text-[8px] xs:text-[9px] sm:text-xs short:text-[7.5px] font-bold text-white truncate max-w-[45px] xs:max-w-[60px] short:max-w-[35px]">
                {leftPlayer.name}
              </span>
              <span className="text-[7px] xs:text-[8px] sm:text-[10px] short:text-[6.5px] text-slate-400">
                Pts: <span className="text-amber-400 font-bold">{room.totalScores?.[leftPlayer.id] ?? 0}</span>
              </span>
              {renderTurnBadge(leftPlayer.seatIndex)}
            </div>

            <div className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 short:px-1 short:py-0 bg-slate-900/90 border border-white/10 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] short:text-[6.5px] font-mono text-slate-300 shadow flex items-center space-x-0.5">
              <span>🂠</span>
              <span>{room.hands?.[leftPlayer.id]?.length || 0}</span>
            </div>
          </div>
        )}

        {/* --- EAST PLAYER (RIGHT) --- */}
        {rightPlayer && (
          <div className="absolute -right-1 xs:-right-3 sm:-right-8 short:-right-1 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-0.5 z-30">
            <div
              className={cn(
                'flex flex-col items-center bg-black/80 border p-1 sm:p-2 short:p-0.5 rounded-lg sm:rounded-2xl shadow-lg backdrop-blur-md space-y-0.5 transition-all',
                room.turnSeatIndex === rightPlayer.seatIndex
                  ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : 'border-white/10'
              )}
            >
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 short:w-4.5 short:h-4.5 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-[10px] xs:text-xs sm:text-base short:text-[9px]">
                {rightPlayer.avatar}
              </div>
              <span className="text-[8px] xs:text-[9px] sm:text-xs short:text-[7.5px] font-bold text-white truncate max-w-[45px] xs:max-w-[60px] short:max-w-[35px]">
                {rightPlayer.name}
              </span>
              <span className="text-[7px] xs:text-[8px] sm:text-[10px] short:text-[6.5px] text-slate-400">
                Pts: <span className="text-amber-400 font-bold">{room.totalScores?.[rightPlayer.id] ?? 0}</span>
              </span>
              {renderTurnBadge(rightPlayer.seatIndex)}
            </div>

            <div className="px-1 py-0.5 sm:px-1.5 sm:py-0.5 short:px-1 short:py-0 bg-slate-900/90 border border-white/10 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] short:text-[6.5px] font-mono text-slate-300 shadow flex items-center space-x-0.5">
              <span>🂠</span>
              <span>{room.hands?.[rightPlayer.id]?.length || 0}</span>
            </div>
          </div>
        )}

        {/* --- CENTER TABLE AREA: ROUNDS 1-3 TRICKS OR ROUND 4 SOLITAIRE --- */}
        {room.currentRound <= 3 ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Lead Suit Indicator */}
            {room.leadSuit && (
              <div className="absolute top-2 sm:top-4 px-2 py-0.5 bg-black/70 border border-white/10 rounded-full text-[9px] sm:text-xs font-mono font-bold text-slate-300 flex items-center space-x-1 backdrop-blur-md">
                <span className="text-slate-400">LEAD:</span>
                <span
                  className={
                    room.leadSuit === 'HEARTS' || room.leadSuit === 'DIAMONDS'
                      ? 'text-red-500 font-black'
                      : 'text-white font-black'
                  }
                >
                  {room.leadSuit === 'HEARTS'
                    ? '♥'
                    : room.leadSuit === 'DIAMONDS'
                    ? '♦'
                    : room.leadSuit === 'CLUBS'
                    ? '♣'
                    : '♠'}{' '}
                  {room.leadSuit}
                </span>
              </div>
            )}

            {/* Current Trick Cards Layout */}
            <div className="relative w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 short:w-32 short:h-32 flex items-center justify-center">
              <AnimatePresence>
                {room.currentTrick?.map((tc: TrickCard) => {
                  const relativeOffset = (tc.seatIndex - mySeatIndex + 4) % 4;

                  let posClasses = '';
                  let initialX = 0;
                  let initialY = 0;

                  if (relativeOffset === 0) {
                    posClasses = 'bottom-0 left-1/2 -translate-x-1/2';
                    initialY = 80;
                  } else if (relativeOffset === 1) {
                    posClasses = 'left-0 top-1/2 -translate-y-1/2';
                    initialX = -80;
                  } else if (relativeOffset === 2) {
                    posClasses = 'top-0 left-1/2 -translate-x-1/2';
                    initialY = -80;
                  } else if (relativeOffset === 3) {
                    posClasses = 'right-0 top-1/2 -translate-y-1/2';
                    initialX = 80;
                  }

                  const p = room.players.find((pl) => pl.seatIndex === tc.seatIndex);

                  return (
                    <motion.div
                      key={tc.card.id}
                      initial={{ opacity: 0, x: initialX, y: initialY, scale: 0.5 }}
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.3 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      className={cn('absolute flex flex-col items-center z-20', posClasses)}
                    >
                      <PlayingCard
                        card={tc.card}
                        size="md"
                        className="shadow-[0_10px_25px_rgba(0,0,0,0.8)] border border-white/20"
                      />
                      <span className="mt-1 text-[8px] sm:text-[10px] font-bold text-slate-300 bg-black/80 px-1.5 py-0.5 rounded-full border border-white/10 truncate max-w-[60px] sm:max-w-[80px]">
                        {p?.name || 'Player'}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Trick Winner Toast */}
            <AnimatePresence>
              {showTrickToast && room.lastCompletedTrick && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute z-40 bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-[0_0_25px_rgba(220,38,38,0.8)] border border-white/20 flex items-center space-x-2"
                >
                  <span>🏆</span>
                  <span>
                    {room.players.find((p) => p.id === room.lastCompletedTrick?.winnerPlayerId)?.name} won trick (+
                    {room.lastCompletedTrick.pointsAwarded} pts)
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* ROUND 4: SOLITAIRE GRID */
          <div className="w-full h-full p-1 sm:p-2 overflow-auto">
            <SolitaireBoardView board={room.solitaireBoard} />
          </div>
        )}
      </div>
    </div>
  );
};
