import { Card, Suit, TrickCard, RoundNumber } from '../types';

// Evaluate Trick Winner for Rounds 1-3
// Rule: Whatever suit was led is the winning suit for that trick.
// Winner is player who played highest card of leadSuit.
export function evaluateTrickWinner(trick: TrickCard[], leadSuit: Suit): TrickCard {
  const leadSuitPlayed = trick.filter((t) => t.card.suit === leadSuit);
  if (leadSuitPlayed.length > 0) {
    return leadSuitPlayed.reduce((max, curr) => (curr.card.value > max.card.value ? curr : max), leadSuitPlayed[0]);
  }
  return trick[0];
}

// Calculate points awarded for a trick based on active round
export function calculateTrickPoints(
  trickCards: TrickCard[],
  roundNumber: RoundNumber
): { points: number; isSuddenDeath: boolean } {
  let points = 0;
  let isSuddenDeath = false;

  if (roundNumber === 1) {
    // Round 1: Hearts -> +5 pts per Heart taken
    const heartCount = trickCards.filter((t) => t.card.suit === 'HEARTS').length;
    points = heartCount * 5;
  } else if (roundNumber === 2) {
    // Round 2: Royal Suite -> +15 pts per Heart Face Card (J, Q, K)
    const royalHearts = trickCards.filter(
      (t) => t.card.suit === 'HEARTS' && (t.card.value === 11 || t.card.value === 12 || t.card.value === 13)
    );
    points = royalHearts.length * 15;
  } else if (roundNumber === 3) {
    // Round 3: Queen of Hearts Sudden Death -> +50 pts if Queen of Hearts taken
    const qhTaken = trickCards.some((t) => t.card.suit === 'HEARTS' && t.card.value === 12);
    if (qhTaken) {
      points = 50;
      isSuddenDeath = true;
    }
  }

  return { points, isSuddenDeath };
}
