import { Card, Suit, RoundNumber, TrickCard, Player } from './types';

export interface SeatVoidMap {
  [seatIndex: number]: Set<Suit>;
}

export interface HazardTracker {
  qhPlayed: boolean;
  qhPlayedBySeat: number | null;
  jqkHeartsPlayedCount: number;
  heartsPlayedCount: number;
  heartsBroken: boolean;
}

export interface SuitDistribution {
  played: number;
  remaining: number;
  playedValues: number[];
}

export interface CardMemory {
  roundNumber: RoundNumber;
  playedCards: Card[];
  playedBySeat: Record<number, Card[]>;
  voidsBySeat: SeatVoidMap;
  suitDistributions: Record<Suit, SuitDistribution>;
  hazards: HazardTracker;
  remainingDeckBySuit: Record<Suit, number[]>;
}

const ALL_VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
const SUITS: Suit[] = ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES'];

/**
 * Creates an empty/initial Card Memory structure for a round.
 */
export function createEmptyCardMemory(roundNumber: RoundNumber): CardMemory {
  const voidsBySeat: SeatVoidMap = {
    0: new Set<Suit>(),
    1: new Set<Suit>(),
    2: new Set<Suit>(),
    3: new Set<Suit>(),
  };

  const playedBySeat: Record<number, Card[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
  };

  const suitDistributions: Record<Suit, SuitDistribution> = {
    HEARTS: { played: 0, remaining: 13, playedValues: [] },
    DIAMONDS: { played: 0, remaining: 13, playedValues: [] },
    CLUBS: { played: 0, remaining: 13, playedValues: [] },
    SPADES: { played: 0, remaining: 13, playedValues: [] },
  };

  const remainingDeckBySuit: Record<Suit, number[]> = {
    HEARTS: [...ALL_VALUES],
    DIAMONDS: [...ALL_VALUES],
    CLUBS: [...ALL_VALUES],
    SPADES: [...ALL_VALUES],
  };

  return {
    roundNumber,
    playedCards: [],
    playedBySeat,
    voidsBySeat,
    suitDistributions,
    hazards: {
      qhPlayed: false,
      qhPlayedBySeat: null,
      jqkHeartsPlayedCount: 0,
      heartsPlayedCount: 0,
      heartsBroken: false,
    },
    remainingDeckBySuit,
  };
}

/**
 * Builds card memory from played cards, completed tricks, and current trick state.
 */
export function buildCardMemoryFromState(
  roundNumber: RoundNumber,
  playedCardsHistory: Card[] = [],
  completedTricks: { cards: TrickCard[] }[] = [],
  currentTrick: TrickCard[] = []
): CardMemory {
  const memory = createEmptyCardMemory(roundNumber);

  // Process completed tricks to identify suit voids and played cards
  completedTricks.forEach((trickInfo) => {
    const trickCards = trickInfo.cards || [];
    if (trickCards.length === 0) return;

    const leadSuit = trickCards[0].card.suit;

    trickCards.forEach((tc) => {
      const card = tc.card;
      const seat = tc.seatIndex;

      // Track card play per seat
      if (!memory.playedBySeat[seat]) memory.playedBySeat[seat] = [];
      memory.playedBySeat[seat].push(card);
      memory.playedCards.push(card);

      // Check void: if player did not follow lead suit, seat is void in leadSuit
      if (card.suit !== leadSuit) {
        if (!memory.voidsBySeat[seat]) memory.voidsBySeat[seat] = new Set<Suit>();
        memory.voidsBySeat[seat].add(leadSuit);
      }

      // Update suit counts
      const dist = memory.suitDistributions[card.suit];
      if (dist && !dist.playedValues.includes(card.value)) {
        dist.played += 1;
        dist.remaining = 13 - dist.played;
        dist.playedValues.push(card.value);
      }

      // Update remaining deck
      memory.remainingDeckBySuit[card.suit] = memory.remainingDeckBySuit[card.suit].filter(
        (v) => v !== card.value
      );

      // Hazard tracking
      if (card.suit === 'HEARTS') {
        memory.hazards.heartsPlayedCount += 1;
        memory.hazards.heartsBroken = true;

        if (card.value === 12) {
          memory.hazards.qhPlayed = true;
          memory.hazards.qhPlayedBySeat = seat;
        }

        if (card.value >= 11 && card.value <= 13) {
          memory.hazards.jqkHeartsPlayedCount += 1;
        }
      }
    });
  });

  // Process current in-progress trick cards
  if (currentTrick.length > 0) {
    const leadSuit = currentTrick[0].card.suit;

    currentTrick.forEach((tc) => {
      const card = tc.card;
      const seat = tc.seatIndex;

      if (!memory.playedBySeat[seat]) memory.playedBySeat[seat] = [];
      // Avoid duplicate counting if already in memory
      if (!memory.playedCards.some((c) => c.id === card.id)) {
        memory.playedBySeat[seat].push(card);
        memory.playedCards.push(card);

        if (card.suit !== leadSuit) {
          if (!memory.voidsBySeat[seat]) memory.voidsBySeat[seat] = new Set<Suit>();
          memory.voidsBySeat[seat].add(leadSuit);
        }

        const dist = memory.suitDistributions[card.suit];
        if (dist && !dist.playedValues.includes(card.value)) {
          dist.played += 1;
          dist.remaining = 13 - dist.played;
          dist.playedValues.push(card.value);
        }

        memory.remainingDeckBySuit[card.suit] = memory.remainingDeckBySuit[card.suit].filter(
          (v) => v !== card.value
        );

        if (card.suit === 'HEARTS') {
          memory.hazards.heartsPlayedCount += 1;
          memory.hazards.heartsBroken = true;

          if (card.value === 12) {
            memory.hazards.qhPlayed = true;
            memory.hazards.qhPlayedBySeat = seat;
          }

          if (card.value >= 11 && card.value <= 13) {
            memory.hazards.jqkHeartsPlayedCount += 1;
          }
        }
      }
    });
  }

  // Also fold in playedCardsHistory if provided
  playedCardsHistory.forEach((card) => {
    if (!memory.playedCards.some((c) => c.id === card.id)) {
      memory.playedCards.push(card);
      const dist = memory.suitDistributions[card.suit];
      if (dist && !dist.playedValues.includes(card.value)) {
        dist.played += 1;
        dist.remaining = 13 - dist.played;
        dist.playedValues.push(card.value);
      }
      memory.remainingDeckBySuit[card.suit] = memory.remainingDeckBySuit[card.suit].filter(
        (v) => v !== card.value
      );
      if (card.suit === 'HEARTS') {
        memory.hazards.heartsPlayedCount += 1;
        memory.hazards.heartsBroken = true;
        if (card.value === 12) memory.hazards.qhPlayed = true;
        if (card.value >= 11 && card.value <= 13) memory.hazards.jqkHeartsPlayedCount += 1;
      }
    }
  });

  return memory;
}

/**
 * Returns remaining unplayed cards in a suit higher than cardValue.
 */
export function getHigherRemainingCards(
  memory: CardMemory,
  suit: Suit,
  cardValue: number
): number[] {
  const remainingInSuit = memory.remainingDeckBySuit[suit] || [];
  return remainingInSuit.filter((v) => v > cardValue);
}

/**
 * Checks whether a given seat is known to be void in a suit.
 */
export function isSeatVoidInSuit(memory: CardMemory, seatIndex: number, suit: Suit): boolean {
  const seatVoids = memory.voidsBySeat[seatIndex];
  return seatVoids ? seatVoids.has(suit) : false;
}
