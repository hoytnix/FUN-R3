import {
  Card,
  Suit,
  RoundNumber,
  SolitaireBoard,
  TrickCard,
  BotDifficulty,
  Player,
  RoomState,
} from './types';
import { getPlayableCards, evaluateTrickWinner } from './game-engine';
import {
  CardMemory,
  buildCardMemoryFromState,
  isSeatVoidInSuit,
  getHigherRemainingCards,
} from './card-memory';

export type BotPersonality = 'CASUAL' | 'CUTTHROAT' | 'CHAOS';
export type ExtendedBotDifficulty = BotDifficulty | BotPersonality;

export type { BotDifficulty };

// Get turn timer duration in seconds based on difficulty/personality
export function getTurnTimerSeconds(difficulty: ExtendedBotDifficulty = 'MEDIUM'): number {
  switch (difficulty) {
    case 'EASY':
    case 'CASUAL':
      return 60;
    case 'MEDIUM':
    case 'CHAOS':
      return 40;
    case 'HARD':
    case 'CUTTHROAT':
      return 20;
    default:
      return 40;
  }
}

export const BOT_NAMES = [
  'Chip AI 🤖',
  'Byte Bot 🤖',
  'Neo Bot 🤖',
  'Pixel AI 🤖',
  'Cipher Bot 🤖',
  'Circuit AI 🤖',
  'Vortex Bot 🤖',
  'Zenith AI 🤖',
];

export const BOT_AVATARS = ['🤖', '👾', '💻', '⚙️', '⚡', '🛸', '🛰️', '🔋'];

/**
 * Returns random artificial delay between 500ms and 900ms
 * strictly following the 500ms–900ms rhythmic play pacing specification.
 */
export function getBotDelay(): number {
  return Math.floor(Math.random() * 400) + 500;
}

/**
 * 1. CASUAL BOT PERSONALITY
 * Naive legal suit-following. Plays simple legal cards without memory or point ducking.
 */
export function pickCasualCard(playable: Card[]): Card {
  if (playable.length === 0) return playable[0];
  // 50% chance random legal card, 50% lowest value card
  if (Math.random() < 0.5) {
    const randomIndex = Math.floor(Math.random() * playable.length);
    return playable[randomIndex];
  }
  return [...playable].sort((a, b) => a.value - b.value)[0];
}

/**
 * Helper: Find game leader seat (the opponent with the lowest total score in F.U.N.)
 */
function getGameLeaderSeat(
  botSeatIndex: number,
  totalScores?: Record<string, number>,
  players: Player[] = []
): number | null {
  if (!totalScores || players.length === 0) return null;

  let minScore = Infinity;
  let leaderSeat: number | null = null;

  players.forEach((p) => {
    if (p.seatIndex !== botSeatIndex) {
      const score = totalScores[p.id] ?? 0;
      if (score < minScore) {
        minScore = score;
        leaderSeat = p.seatIndex;
      }
    }
  });

  return leaderSeat;
}

/**
 * 2. CUTTHROAT BOT PERSONALITY
 * Card counting memory module, point ducking, targeted Heart dumping on game leaders, void exploitation.
 */
export function pickCutthroatCard(
  playable: Card[],
  hand: Card[],
  leadSuit: Suit | null,
  currentRound: RoundNumber,
  solitaireBoard?: SolitaireBoard,
  currentTrick: TrickCard[] = [],
  memory?: CardMemory,
  totalScores?: Record<string, number>,
  botSeatIndex: number = 0,
  players: Player[] = []
): Card {
  if (playable.length === 0) return playable[0];
  if (playable.length === 1) return playable[0];

  const gameLeaderSeat = getGameLeaderSeat(botSeatIndex, totalScores, players);

  if (currentRound <= 3) {
    // TRICK TAKING ROUNDS (Rounds 1, 2, 3)

    // A. FOLLOWING SUIT IN A TRICK
    if (leadSuit && currentTrick.length > 0) {
      const isFollowingSuit = playable.every((c) => c.suit === leadSuit);

      if (isFollowingSuit) {
        // Find highest card played in lead suit so far
        const leadSuitTrickCards = currentTrick.filter((t) => t.card.suit === leadSuit);
        const maxLeadVal = leadSuitTrickCards.length > 0
          ? Math.max(...leadSuitTrickCards.map((t) => t.card.value))
          : 0;

        // POINT DUCKING: Cards that will NOT win the trick
        const safeDuckingCards = playable.filter((c) => c.value < maxLeadVal);

        if (safeDuckingCards.length > 0) {
          // Play the HIGHEST safe card (sheds high card while ducking points!)
          return safeDuckingCards.sort((a, b) => b.value - a.value)[0];
        }

        // Forced to win the trick: play LOWEST winning card to minimize taking high cards
        return [...playable].sort((a, b) => a.value - b.value)[0];
      } else {
        // B. SLOUGHING OFF (Void in lead suit) -> TARGETED HAZARD DUMPING!
        const heartsInHand = playable.filter((c) => c.suit === 'HEARTS');

        // Round 3: Queen of Hearts (50 pts Sudden Death hazard)
        if (currentRound === 3) {
          const qhCard = playable.find((c) => c.suit === 'HEARTS' && c.value === 12);
          if (qhCard) {
            // TARGET DUMP: Drop Queen of Hearts on game leader or trick winner!
            return qhCard;
          }
        }

        // Round 2: J, Q, K of Hearts (10 pts each)
        if (currentRound === 2) {
          const jqkHearts = heartsInHand.filter((c) => c.value >= 11 && c.value <= 13);
          if (jqkHearts.length > 0) {
            // Dump highest J, Q, or K of Hearts
            return jqkHearts.sort((a, b) => b.value - a.value)[0];
          }
        }

        // Round 1: Any Hearts (1 pt each)
        if (heartsInHand.length > 0) {
          // Dump highest Heart
          return heartsInHand.sort((a, b) => b.value - a.value)[0];
        }

        // No Hearts available: Dump highest non-lead card (Aces/Kings of other suits)
        return [...playable].sort((a, b) => b.value - a.value)[0];
      }
    }

    // C. LEADING A TRICK (leadSuit is null) -> VOID EXPLOITATION & CARD COUNTING
    if (!leadSuit) {
      // Avoid leading Hearts unless necessary or safe
      const nonHearts = playable.filter((c) => c.suit !== 'HEARTS');

      if (nonHearts.length > 0) {
        if (memory && gameLeaderSeat !== null) {
          // VOID EXPLOITATION: Find a suit where game leader is known to be VOID!
          const voidSuitsForLeader = nonHearts.filter((c) =>
            isSeatVoidInSuit(memory, gameLeaderSeat, c.suit)
          );

          if (voidSuitsForLeader.length > 0) {
            // Lead suit where game leader is void (leader cannot win or follow!)
            return voidSuitsForLeader.sort((a, b) => a.value - b.value)[0];
          }
        }

        // CARD COUNTING: Lead low card in a suit where higher cards remain in deck
        if (memory) {
          let bestLeadCard = nonHearts[0];
          let maxHigherOutstanding = -1;

          for (const card of nonHearts) {
            const higherOutstanding = getHigherRemainingCards(
              memory,
              card.suit,
              card.value
            ).length;
            if (higherOutstanding > maxHigherOutstanding) {
              maxHigherOutstanding = higherOutstanding;
              bestLeadCard = card;
            }
          }
          return bestLeadCard;
        }

        // Default lead lowest non-heart
        return nonHearts.sort((a, b) => a.value - b.value)[0];
      }

      // Forced to lead Hearts: play lowest Heart
      return [...playable].sort((a, b) => a.value - b.value)[0];
    }
  } else {
    // ROUND 4: SOLITAIRE RACE (AROUND THE WORLD)
    const sevens = playable.filter((c) => c.value === 7);

    if (sevens.length > 0) {
      // Prioritize 7 that unlocks the most follow-up cards in Cutthroat's hand
      let bestSeven = sevens[0];
      let maxFollowUps = -1;

      for (const seven of sevens) {
        const followUps = hand.filter(
          (c) => c.suit === seven.suit && (c.value === 6 || c.value === 8)
        ).length;
        if (followUps > maxFollowUps) {
          maxFollowUps = followUps;
          bestSeven = seven;
        }
      }
      return bestSeven;
    }

    // Pick card connecting to other cards in hand
    let bestCard = playable[0];
    let maxConnections = -1;

    for (const card of playable) {
      const connections = hand.filter(
        (c) => c.suit === card.suit && (c.value === card.value - 1 || c.value === card.value + 1)
      ).length;
      if (connections > maxConnections) {
        maxConnections = connections;
        bestCard = card;
      }
    }
    return bestCard;
  }

  return playable[0];
}

/**
 * 3. CHAOS BOT PERSONALITY
 * High variance, unexpected trump/hazard plays. Unpredictable tactical drops.
 */
export function pickChaosCard(
  playable: Card[],
  leadSuit: Suit | null,
  currentRound: RoundNumber,
  solitaireBoard?: SolitaireBoard
): Card {
  if (playable.length === 0) return playable[0];
  if (playable.length === 1) return playable[0];

  // 40% probability of triggering chaotic / high-variance move
  const isChaoticMove = Math.random() < 0.4;

  if (isChaoticMove) {
    if (currentRound <= 3) {
      if (!leadSuit) {
        // UNEXPECTED LEAD: Lead a Heart unexpectedly in Round 1 or 2 to flush out hazards!
        const hearts = playable.filter((c) => c.suit === 'HEARTS');
        if (hearts.length > 0) {
          return hearts[Math.floor(Math.random() * hearts.length)];
        }
      } else {
        // UNEXPECTED DROP: Drop highest unexpected card
        return [...playable].sort((a, b) => b.value - a.value)[0];
      }
    } else {
      // Round 4 Solitaire: Pick random valid card instead of optimal 7s
      return playable[Math.floor(Math.random() * playable.length)];
    }
  }

  // Otherwise, default to standard legal selection
  return pickCasualCard(playable);
}

/**
 * Main AI Strategy Selection Engine:
 * Chooses card based on Bot Personality / Difficulty settings and Card Memory.
 */
export function pickBotCard(
  hand: Card[],
  leadSuit: Suit | null,
  currentRound: RoundNumber,
  solitaireBoard?: SolitaireBoard,
  currentTrick: TrickCard[] = [],
  difficultyOrPersonality: ExtendedBotDifficulty = 'MEDIUM',
  roomOrMemoryContext?: Partial<RoomState> | CardMemory,
  botSeatIndex: number = 0
): Card | null {
  const playable = getPlayableCards(hand, leadSuit, currentRound, solitaireBoard);
  if (playable.length === 0) return null;
  if (playable.length === 1) return playable[0];

  // Derive card memory if room context provided
  let memory: CardMemory | undefined;
  let totalScores: Record<string, number> | undefined;
  let players: Player[] = [];

  if (roomOrMemoryContext) {
    if ('roundNumber' in roomOrMemoryContext && 'voidsBySeat' in roomOrMemoryContext) {
      memory = roomOrMemoryContext as CardMemory;
    } else {
      const room = roomOrMemoryContext as Partial<RoomState>;
      totalScores = room.totalScores;
      players = room.players || [];
      memory = buildCardMemoryFromState(
        currentRound,
        room.playedCardsHistory || [],
        room.lastCompletedTrick ? [room.lastCompletedTrick] : [],
        currentTrick
      );
    }
  }

  // Map settings to Bot Personalities:
  // EASY / CASUAL -> Casual
  // MEDIUM -> Balanced (mix of Cutthroat & Casual)
  // HARD / CUTTHROAT -> Cutthroat
  // CHAOS -> Chaos

  if (difficultyOrPersonality === 'EASY' || difficultyOrPersonality === 'CASUAL') {
    return pickCasualCard(playable);
  }

  if (difficultyOrPersonality === 'CHAOS') {
    return pickChaosCard(playable, leadSuit, currentRound, solitaireBoard);
  }

  if (difficultyOrPersonality === 'HARD' || difficultyOrPersonality === 'CUTTHROAT') {
    return pickCutthroatCard(
      playable,
      hand,
      leadSuit,
      currentRound,
      solitaireBoard,
      currentTrick,
      memory,
      totalScores,
      botSeatIndex,
      players
    );
  }

  // MEDIUM: 50% Cutthroat, 50% Casual
  if (Math.random() < 0.5) {
    return pickCutthroatCard(
      playable,
      hand,
      leadSuit,
      currentRound,
      solitaireBoard,
      currentTrick,
      memory,
      totalScores,
      botSeatIndex,
      players
    );
  }

  return pickCasualCard(playable);
}
