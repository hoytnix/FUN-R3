import { useState, useEffect } from 'react';
import {
  OfflineGameState,
  initOfflineGame,
  loadOfflineState,
  clearOfflineState,
  dismissOfflineShield,
  toggleOfflineManualShield,
  playOfflineCard,
  passOfflineSolitaire,
  advanceOfflineRound,
  resolveOfflineTrick,
} from '@/lib/offline-engine';
import { soundEngine } from '@/lib/audio';

export function useOfflineGameSession(mode: string, setMode: (m: any) => void, setView: (v: any) => void) {
  const [offlineState, setOfflineState] = useState<OfflineGameState | null>(() => {
    if (typeof window !== 'undefined') {
      return loadOfflineState();
    }
    return null;
  });

  // Trick Resolution Timer
  useEffect(() => {
    if (mode === 'OFFLINE' && offlineState && offlineState.status === 'TRICK_EVALUATION') {
      if (offlineState.currentRound === 3 && offlineState.lastCompletedTrick?.pointsAwarded === 50) {
        soundEngine.playSuddenDeath();
      } else {
        soundEngine.playTrickSweep();
      }
      const timer = setTimeout(() => {
        const resolved = resolveOfflineTrick(offlineState);
        setOfflineState(resolved);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [offlineState, mode]);

  const handleStartLocalMatch = (localNames: string[], localAvatars: string[], localTimerSeconds: number) => {
    soundEngine.playClick();
    const newOfflineState = initOfflineGame(localNames, localAvatars, localTimerSeconds);
    setOfflineState(newOfflineState);
    setMode('OFFLINE');
    setView('GAME');
  };

  const handleResumeLocalMatch = () => {
    if (!offlineState) return;
    soundEngine.playClick();
    setMode('OFFLINE');
    setView('GAME');
  };

  const handleClearLocalSession = () => {
    clearOfflineState();
    setOfflineState(null);
  };

  return {
    offlineState,
    setOfflineState,
    handleStartLocalMatch,
    handleResumeLocalMatch,
    handleClearLocalSession,
    playOfflineCard: (card: any, currentOfflinePlayer: any) => {
      if (!offlineState || !currentOfflinePlayer) return;
      soundEngine.playCardSnap();
      const next = playOfflineCard(offlineState, currentOfflinePlayer.id, card);
      setOfflineState(next);
    },
    passOfflineSolitaire: (currentOfflinePlayer: any) => {
      if (!offlineState || !currentOfflinePlayer) return;
      soundEngine.playClick();
      const next = passOfflineSolitaire(offlineState, currentOfflinePlayer.id);
      setOfflineState(next);
    },
    advanceOfflineRound: () => {
      if (!offlineState) return;
      const next = advanceOfflineRound(offlineState);
      setOfflineState(next);
    },
    toggleOfflineShield: () => {
      if (offlineState) {
        setOfflineState(toggleOfflineManualShield(offlineState));
      }
    },
    dismissOfflineShield: () => {
      if (offlineState) {
        setOfflineState(dismissOfflineShield(offlineState));
      }
    },
  };
}
