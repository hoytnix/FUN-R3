import { OfflineGameState } from '../offline-engine';

const LOCAL_STORAGE_KEY = 'FUN_OFFLINE_SESSION';

export const DEFAULT_AVATARS = ['👑', '🦊', '⚡', '🐉', '🤡', '🐼', '🚀', '🔮'];

export function saveOfflineState(state: OfflineGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save offline state to localStorage', err);
  }
}

export function loadOfflineState(): OfflineGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.players && parsed.players.length === 4) {
      return parsed as OfflineGameState;
    }
  } catch (err) {
    console.error('Failed to load offline state from localStorage', err);
  }
  return null;
}

export function clearOfflineState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear offline state', err);
  }
}
