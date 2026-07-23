import { Card, SolitaireBoard } from '../types';

// Create fresh initial Solitaire Board state for Round 4
export function createInitialSolitaireBoard(): SolitaireBoard {
  return {
    placed: {
      HEARTS: [],
      DIAMONDS: [],
      CLUBS: [],
      SPADES: [],
    },
    minAvailable: {
      HEARTS: null,
      DIAMONDS: null,
      CLUBS: null,
      SPADES: null,
    },
    maxAvailable: {
      HEARTS: null,
      DIAMONDS: null,
      CLUBS: null,
      SPADES: null,
    },
  };
}

// Apply a card play to Solitaire Board state
export function updateSolitaireBoard(board: SolitaireBoard, card: Card): SolitaireBoard {
  const suit = card.suit;
  const val = card.value;
  const newPlaced = { ...board.placed, [suit]: [...(board.placed[suit] || []), val] };
  const newMin = { ...board.minAvailable };
  const newMax = { ...board.maxAvailable };

  if (val === 7) {
    newMin[suit] = 6;
    newMax[suit] = 8;
  } else {
    if (newMin[suit] === val) {
      newMin[suit] = val > 2 ? val - 1 : null;
    }
    if (newMax[suit] === val) {
      newMax[suit] = val < 14 ? val + 1 : null;
    }
  }

  return {
    placed: newPlaced,
    minAvailable: newMin,
    maxAvailable: newMax,
  };
}
