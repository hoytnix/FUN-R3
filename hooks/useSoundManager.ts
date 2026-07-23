import { useCallback } from 'react';
import { soundEngine, triggerHaptic } from '@/lib/audio';

export function useSoundManager() {
  const playClick = useCallback(() => {
    soundEngine.playClick();
  }, []);

  const playCardSnap = useCallback(() => {
    soundEngine.playCardSnap();
  }, []);

  const playTrickSweep = useCallback(() => {
    soundEngine.playTrickSweep();
  }, []);

  const playYourTurn = useCallback(() => {
    soundEngine.playYourTurn();
  }, []);

  const playVictoryFanfare = useCallback(() => {
    soundEngine.playVictoryFanfare();
  }, []);

  const vibrateCardPlay = useCallback(() => {
    soundEngine.vibrateCardPlay();
  }, []);

  const vibrateTrickWin = useCallback(() => {
    soundEngine.vibrateTrickWin();
  }, []);

  const vibrateHaptic = useCallback((pattern: number | number[]) => {
    triggerHaptic(pattern);
  }, []);

  return {
    playClick,
    playCardSnap,
    playTrickSweep,
    playYourTurn,
    playVictoryFanfare,
    vibrateCardPlay,
    vibrateTrickWin,
    vibrateHaptic,
  };
}
