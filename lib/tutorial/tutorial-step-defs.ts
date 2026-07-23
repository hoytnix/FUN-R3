import { Suit, RoundNumber, Player, Card, TrickCard } from '../types';

export interface TutorialStepDefinition {
  id: number;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  conceptText: string;
  ruleExplanation: string;
  roundNumber: RoundNumber;
  leadSuit: Suit;
  players: Player[];
  botCardsPlayedBeforePlayer: TrickCard[];
  botCardsPlayedAfterPlayer: TrickCard[];
  playerHand: Card[];
  targetCardId: string;
  wrongCardFeedback: Record<string, string>;
  warningOverlay?: {
    title: string;
    message: string;
    severity: 'warning' | 'danger';
  };
  successMessage: string;
  trickWinnerSeat: number;
  pointsExchanged: number;
}

export const TUTORIAL_STEP_DEFINITIONS: TutorialStepDefinition[] = [
  // STEP 1: Trump & Follow Suit
  {
    id: 1,
    title: 'Follow Suit Mandatory',
    badge: 'Step 1 of 4',
    subtitle: 'Trick-Taking Fundamentals',
    description: 'In F.U.N., when a suit is led, you MUST play a card of that same suit if you hold one in your hand.',
    conceptText: 'Bot 1 led the 8 of Spades. You hold 3 of Spades, A of Diamonds, and 5 of Hearts.',
    ruleExplanation: 'Because you hold the 3 of Spades, you MUST follow suit. You cannot play Diamonds or Hearts!',
    roundNumber: 1,
    leadSuit: 'SPADES',
    players: [
      { id: 'player_you', name: 'You (South)', avatar: '🖕', seatIndex: 0, isHost: true, isBot: false, connected: true, lastSeen: Date.now() },
      { id: 'bot_1', name: 'Bot Rex (West)', avatar: '🦊', seatIndex: 1, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_2', name: 'Bot Viper (North)', avatar: '⚡', seatIndex: 2, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_3', name: 'Bot Titan (East)', avatar: '🐉', seatIndex: 3, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    ],
    botCardsPlayedBeforePlayer: [
      { playerId: 'bot_1', seatIndex: 1, card: { id: 'SPADES-8', suit: 'SPADES', value: 8 } },
      { playerId: 'bot_2', seatIndex: 2, card: { id: 'SPADES-10', suit: 'SPADES', value: 10 } },
    ],
    botCardsPlayedAfterPlayer: [
      { playerId: 'bot_3', seatIndex: 3, card: { id: 'SPADES-6', suit: 'SPADES', value: 6 } },
    ],
    playerHand: [
      { id: 'SPADES-3', suit: 'SPADES', value: 3 },
      { id: 'DIAMONDS-14', suit: 'DIAMONDS', value: 14 },
      { id: 'HEARTS-5', suit: 'HEARTS', value: 5 },
    ],
    targetCardId: 'SPADES-3',
    wrongCardFeedback: {
      'DIAMONDS-14': 'Illegal move! You hold 3 of Spades, so you must follow suit.',
      'HEARTS-5': 'Illegal move! You cannot dump Hearts when you have a Spade to follow suit.',
    },
    successMessage: 'Perfect! Following suit is strictly enforced in F.U.N. Your 3 of Spades is low, keeping you safe from taking the trick!',
    trickWinnerSeat: 2,
    pointsExchanged: 0,
  },

  // STEP 2: Hearts Penalty (Round 1)
  {
    id: 2,
    title: 'Hearts Penalty Avoidance',
    badge: 'Step 2 of 4',
    subtitle: 'Round 1: +5 Pts per Heart',
    description: 'In Round 1, taking Hearts awards +5 penalty points per Heart card in the trick. Goal: low score wins!',
    conceptText: 'Bot 1 led 7 of Clubs. Bot 2 dumped Ace of Hearts (+5 pts trap!). You hold 10 of Clubs, Ace of Hearts, and 2 of Diamonds.',
    ruleExplanation: 'You might want to dump Ace of Hearts, but you have 10 of Clubs! You MUST play 10 of Clubs to follow suit.',
    roundNumber: 1,
    leadSuit: 'CLUBS',
    players: [
      { id: 'player_you', name: 'You (South)', avatar: '🖕', seatIndex: 0, isHost: true, isBot: false, connected: true, lastSeen: Date.now() },
      { id: 'bot_1', name: 'Bot Rex (West)', avatar: '🦊', seatIndex: 1, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_2', name: 'Bot Viper (North)', avatar: '⚡', seatIndex: 2, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_3', name: 'Bot Titan (East)', avatar: '🐉', seatIndex: 3, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    ],
    botCardsPlayedBeforePlayer: [
      { playerId: 'bot_1', seatIndex: 1, card: { id: 'CLUBS-7', suit: 'CLUBS', value: 7 } },
      { playerId: 'bot_2', seatIndex: 2, card: { id: 'HEARTS-14', suit: 'HEARTS', value: 14 } },
    ],
    botCardsPlayedAfterPlayer: [
      { playerId: 'bot_3', seatIndex: 3, card: { id: 'CLUBS-4', suit: 'CLUBS', value: 4 } },
    ],
    playerHand: [
      { id: 'CLUBS-10', suit: 'CLUBS', value: 10 },
      { id: 'HEARTS-14', suit: 'HEARTS', value: 14 },
      { id: 'DIAMONDS-2', suit: 'DIAMONDS', value: 2 },
    ],
    targetCardId: 'CLUBS-10',
    wrongCardFeedback: {
      'HEARTS-14': 'Action Locked! You hold 10 of Clubs, so suit-following rules prohibit playing the Ace of Hearts.',
      'DIAMONDS-2': 'Action Locked! You cannot play Diamonds when you hold Clubs.',
    },
    successMessage: 'Excellent discipline! Playing 10 of Clubs followed suit. Bot 1 wins the trick with 7 of Clubs and takes the +5 Heart penalty!',
    trickWinnerSeat: 1,
    pointsExchanged: 5,
  },

  // STEP 3: Royal Suite Penalty (Round 2)
  {
    id: 3,
    title: 'Royal Suite Penalty (+15 pts)',
    badge: 'Step 3 of 4',
    subtitle: 'Round 2: Royal Hearts Hazard',
    description: 'In Round 2, Face Cards of Hearts (Jack, Queen, King of Hearts) carry a heavy +15 penalty points each!',
    conceptText: 'Bot 1 led Jack of Hearts (11). Bot 2 played 9 of Hearts. You hold King of Hearts (13) and 5 of Clubs.',
    ruleExplanation: 'Hearts was led! You hold King of Hearts (13). Since Hearts is led, you must play King of Hearts, taking the trick and incurring +30 penalty points (Jack + King)!',
    roundNumber: 2,
    leadSuit: 'HEARTS',
    players: [
      { id: 'player_you', name: 'You (South)', avatar: '🖕', seatIndex: 0, isHost: true, isBot: false, connected: true, lastSeen: Date.now() },
      { id: 'bot_1', name: 'Bot Rex (West)', avatar: '🦊', seatIndex: 1, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_2', name: 'Bot Viper (North)', avatar: '⚡', seatIndex: 2, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_3', name: 'Bot Titan (East)', avatar: '🐉', seatIndex: 3, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    ],
    botCardsPlayedBeforePlayer: [
      { playerId: 'bot_1', seatIndex: 1, card: { id: 'HEARTS-11', suit: 'HEARTS', value: 11 } },
      { playerId: 'bot_2', seatIndex: 2, card: { id: 'HEARTS-9', suit: 'HEARTS', value: 9 } },
    ],
    botCardsPlayedAfterPlayer: [
      { playerId: 'bot_3', seatIndex: 3, card: { id: 'HEARTS-4', suit: 'HEARTS', value: 4 } },
    ],
    playerHand: [
      { id: 'HEARTS-13', suit: 'HEARTS', value: 13 },
      { id: 'CLUBS-5', suit: 'CLUBS', value: 5 },
    ],
    targetCardId: 'HEARTS-13',
    wrongCardFeedback: {
      'CLUBS-5': 'Action Locked! Hearts was led, so you must play your King of Hearts.',
    },
    warningOverlay: {
      title: 'ROYAL HEARTS PENALTY WARNING',
      message: 'Jack of Hearts (+15 pts) was led! Playing King of Hearts will take this trick for +30 pts total!',
      severity: 'warning',
    },
    successMessage: 'Trick evaluation complete! Because King of Hearts is the highest Heart played, you won the trick and took +30 pts (Jack + King). Learn to dump Royal Hearts early!',
    trickWinnerSeat: 0,
    pointsExchanged: 30,
  },

  // STEP 4: Sudden Death (Round 3)
  {
    id: 4,
    title: 'Sudden Death Avoidance',
    badge: 'Step 4 of 4',
    subtitle: 'Round 3: Queen of Hearts (+50 pts)',
    description: 'In Round 3, taking the Queen of Hearts awards a massive +50 penalty points! You must duck under high cards to avoid taking her.',
    conceptText: 'Bot 1 led King of Spades (13). Bot 2 had no Spades and dumped the Queen of Hearts (+50 pts)! You hold 4 of Spades and Ace of Spades.',
    ruleExplanation: 'If you play Ace of Spades (14), you beat the King (13), win the trick, and eat +50 points! Play 4 of Spades to duck under King of Spades!',
    roundNumber: 3,
    leadSuit: 'SPADES',
    players: [
      { id: 'player_you', name: 'You (South)', avatar: '🖕', seatIndex: 0, isHost: true, isBot: false, connected: true, lastSeen: Date.now() },
      { id: 'bot_1', name: 'Bot Rex (West)', avatar: '🦊', seatIndex: 1, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_2', name: 'Bot Viper (North)', avatar: '⚡', seatIndex: 2, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
      { id: 'bot_3', name: 'Bot Titan (East)', avatar: '🐉', seatIndex: 3, isHost: false, isBot: true, connected: true, lastSeen: Date.now() },
    ],
    botCardsPlayedBeforePlayer: [
      { playerId: 'bot_1', seatIndex: 1, card: { id: 'SPADES-13', suit: 'SPADES', value: 13 } },
      { playerId: 'bot_2', seatIndex: 2, card: { id: 'HEARTS-12', suit: 'HEARTS', value: 12 } },
    ],
    botCardsPlayedAfterPlayer: [
      { playerId: 'bot_3', seatIndex: 3, card: { id: 'SPADES-9', suit: 'SPADES', value: 9 } },
    ],
    playerHand: [
      { id: 'SPADES-4', suit: 'SPADES', value: 4 },
      { id: 'SPADES-14', suit: 'SPADES', value: 14 },
    ],
    targetCardId: 'SPADES-4',
    wrongCardFeedback: {
      'SPADES-14': 'CRITICAL WARNING! Playing Ace of Spades will beat King of Spades, winning the trick and taking the +50 Queen of Hearts!',
    },
    warningOverlay: {
      title: '🚨 SUDDEN DEATH QUEEN OF HEARTS DETECTED! 🚨',
      message: 'Queen of Hearts (+50 pts) is sitting in the trick! Playing Ace of Spades will force you to eat 50 penalty points! DUCK UNDER with 4 of Spades!',
      severity: 'danger',
    },
    successMessage: 'Masterful play! Your 4 of Spades ducked safely under King of Spades. Bot 1 wins the trick and absorbs the +50 Sudden Death penalty!',
    trickWinnerSeat: 1,
    pointsExchanged: 50,
  },
];
