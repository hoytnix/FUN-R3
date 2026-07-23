import { Card, Suit, CardValue, TrickCard, RoundNumber, SolitaireBoard } from './types';
import { evaluateTrickWinner, calculateTrickPoints } from './rules/trick-rules';
import { createInitialSolitaireBoard, updateSolitaireBoard } from './rules/solitaire-rules';

export { evaluateTrickWinner, calculateTrickPoints };
export { createInitialSolitaireBoard, updateSolitaireBoard };

// Suit order for hand sorting
export const SUIT_ORDER: Record<Suit, number> = {
  HEARTS: 0,
  DIAMONDS: 1,
  CLUBS: 2,
  SPADES: 3,
};

// Format card display name (e.g. Jack of Hearts instead of 11 of Hearts)
export function formatCardName(card: Card): string {
  const rankMap: Record<number, string> = {
    11: 'Jack',
    12: 'Queen',
    13: 'King',
    14: 'Ace',
  };
  const rankStr = rankMap[card.value] || card.value.toString();
  const suitStr = card.suit.charAt(0) + card.suit.slice(1).toLowerCase();
  return `${rankStr} of ${suitStr}`;
}

// Create standard 52 deck
export function createDeck(): Card[] {
  const suits: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];
  const values: CardValue[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      deck.push({
        id: `${suit}-${value}`,
        suit,
        value,
      });
    }
  }

  return deck;
}

// Fisher-Yates Shuffle
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Sort cards by suit then by value descending
export function sortHand(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => {
    if (SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]) {
      return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
    }
    return b.value - a.value;
  });
}

// Deal 13 cards to 4 players
export function dealHands(deck: Card[]): Record<string, Card[]> {
  const shuffled = shuffleDeck(deck);
  const hands: Record<string, Card[]> = {};

  // Assuming 4 hands, 0 to 3
  for (let seat = 0; seat < 4; seat++) {
    const seatCards = shuffled.slice(seat * 13, (seat + 1) * 13);
    hands[seat.toString()] = sortHand(seatCards);
  }

  return hands;
}

// Determine playable cards for a player given current state
export function getPlayableCards(
  hand: Card[],
  leadSuit: Suit | null,
  currentRound: RoundNumber,
  solitaireBoard?: SolitaireBoard
): Card[] {
  if (hand.length === 0) return [];

  if (currentRound <= 3) {
    // Rounds 1-3 Trick Taking
    if (!leadSuit) {
      // Leader can play any card in hand
      return hand;
    }

    // Must follow led suit if player holds any cards of leadSuit
    const matchingSuitCards = hand.filter((c) => c.suit === leadSuit);
    if (matchingSuitCards.length > 0) {
      return matchingSuitCards;
    }

    // Otherwise player can play any card in hand
    return hand;
  }

  // Round 4: Around The World (Solitaire Dominoes Race)
  if (!solitaireBoard) return [];

  const playable: Card[] = [];

  for (const card of hand) {
    const placedInSuit = solitaireBoard.placed[card.suit] || [];

    if (card.value === 7) {
      // 7s can always be played if suit hasn't started or 7 is available
      if (!placedInSuit.includes(7)) {
        playable.push(card);
      }
    } else if (placedInSuit.includes(7)) {
      const minAvail = solitaireBoard.minAvailable[card.suit];
      const maxAvail = solitaireBoard.maxAvailable[card.suit];

      if (minAvail !== null && card.value === minAvail) {
        playable.push(card);
      } else if (maxAvail !== null && card.value === maxAvail) {
        playable.push(card);
      }
    }
  }

  return playable;
}

// Bot AI card choice
export function botPickCard(
  hand: Card[],
  playableCards: Card[],
  currentRound: RoundNumber,
  leadSuit: Suit | null
): Card | null {
  if (playableCards.length === 0) return null;

  if (currentRound <= 3) {
    // Avoid taking points! Play lowest card if safe, or highest safe card
    if (currentRound === 1) {
      // Avoid Hearts!
      const nonHearts = playableCards.filter((c) => c.suit !== 'HEARTS');
      if (nonHearts.length > 0) {
        // Play highest non-heart to dump high cards
        return nonHearts.sort((a, b) => b.value - a.value)[0];
      }
      // If forced to play Heart, play lowest Heart
      return playableCards.sort((a, b) => a.value - b.value)[0];
    } else if (currentRound === 2) {
      // Avoid J, Q, K of Hearts!
      const safeCards = playableCards.filter(
        (c) => !(c.suit === 'HEARTS' && c.value >= 11 && c.value <= 13)
      );
      if (safeCards.length > 0) {
        return safeCards.sort((a, b) => b.value - a.value)[0];
      }
      return playableCards.sort((a, b) => a.value - b.value)[0];
    } else if (currentRound === 3) {
      // Avoid Queen of Hearts at all costs!
      const nonQh = playableCards.filter((c) => !(c.suit === 'HEARTS' && c.value === 12));
      if (nonQh.length > 0) {
        return nonQh.sort((a, b) => b.value - a.value)[0];
      }
      return playableCards[0];
    }
  }

  // Default / Round 4 Solitaire: play any legal card
  return playableCards[0];
}

