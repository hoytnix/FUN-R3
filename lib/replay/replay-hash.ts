import { Card, Suit, SolitaireBoard } from '../types';

/**
 * Deterministic FNV-1a 32-bit Hash Function
 * Computes a lightweight 8-character hex checksum string of state components.
 */
export function computeStateHash(state: {
  roundNumber: number;
  activeSeat: number;
  hands: Record<number, Card[]>;
  currentTrickCards?: Card[];
  solitaireBoard?: SolitaireBoard;
  scores?: Record<string, number[]>;
  totalScores?: Record<string, number>;
}): string {
  // Construct canonical deterministic string
  const sortedHands = Object.keys(state.hands)
    .sort((a, b) => Number(a) - Number(b))
    .map((seat) => {
      const cards = state.hands[Number(seat)] || [];
      const cardIds = cards.map((c) => c.id).sort().join(',');
      return `s${seat}:${cardIds}`;
    })
    .join('|');

  const trickStr = (state.currentTrickCards || []).map((c) => c.id).join(',');

  let solitaireStr = '';
  if (state.solitaireBoard) {
    const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
    solitaireStr = suits
      .map((s) => `${s}:[${(state.solitaireBoard!.placed[s] || []).join(',')}]`)
      .join(';');
  }

  let scoreStr = '';
  if (state.totalScores) {
    scoreStr = Object.keys(state.totalScores)
      .sort()
      .map((pid) => `${pid}:${state.totalScores![pid]}`)
      .join(';');
  }

  const rawString = `R:${state.roundNumber}|S:${state.activeSeat}|H:${sortedHands}|T:${trickStr}|SOL:${solitaireStr}|PTS:${scoreStr}`;

  // FNV-1a Hash Algorithm
  let hash = 0x811c9dc5;
  for (let i = 0; i < rawString.length; i++) {
    hash ^= rawString.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // Convert to 8-character unsigned hex string
  return (hash >>> 0).toString(16).padStart(8, '0');
}
