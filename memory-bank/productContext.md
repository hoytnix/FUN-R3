# Product Context: User Experience & Game Mechanics

## Core Value Proposition & Vision
Standard card games reward taking tricks and accumulating high cards. **"Fuck Ur Neighbor" (F.U.N.)** flips this paradigm upside down: **Trump (Hearts) is a liability**. Strategy revolves around dumping high cards onto opponents, ducking under high leads, and carefully preserving safe exit cards for the chaotic Round 4 Solitaire race.

The name reflects the gameplay: players actively maneuver to "fuck over" neighboring seats by loading them with penalties or trapping them in Solitaire pass loops.

---

## User Experience (UX) Pillars

### 1. Mobile-First PWA Ergonomics
* **Touch Targets & Gestures:** Tap-to-select and tap-to-play card interactions designed for single-thumb mobile usage. `touch-action: manipulation` prevents browser double-tap zoom delays.
* **Orientation Lock & Layout:** Tailored portrait orientation UI with felt-table playing area, dynamic seat positioning (South = Player, North/East/West = Opponents), and central trick pile with Framer Motion card fling animations.
* **Standalone Display:** Configured manifest (`/public/manifest.json`) supporting PWA home screen installation with custom icon and theme colors.

### 2. Privacy Shield for Local Pass & Play (`PassShield.tsx`)
* When playing on a shared physical device, hand confidentiality is critical.
* At the end of each local turn, the **PassShield** modal obscures the screen with a blur backdrop and explicit "Pass device to [Player Name]" prompt.
* Requires a conscious "Tap to Reveal Hand" action from the recipient before unmasking cards.

### 3. Immediate Feedback & Auditing
* **Audio Synthesis Engine (`lib/audio.ts`):** Web Audio API synthesizer generating procedural sound effects for dealing, playing cards, trick wins, penalty alerts, Solitaire passes, and victory fanfare without external MP3 asset dependency.
* **Interactive Scoreboard & Match History:** Live slide-over modal displaying round-by-round score breakdowns (`ScoreboardModal.tsx`) and historical replay playback (`MatchHistoryModal.tsx`).
* **In-Game Tutorial Sandbox (`OnboardingSandbox.tsx`):** Guided step-by-step interactive walkthrough for first-time players to learn trick-taking rules and Solitaire mechanics.

---

## Key Gameplay Mechanics & Rule Matrix

```
[DEAL 13 CARDS EACH]
       │
       ▼
 ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
 │  ROUND 1  │ ──► │  ROUND 2  │ ──► │  ROUND 3  │ ──► │  ROUND 4  │
 │  Hearts   │     │Royal Suite│     │Queen Sudden│    │ Solitaire │
 └───────────┘     └───────────┘     └───────────┘     └───────────┘
   +5 pts/♥         +15 pts/J,Q,K♥     +50 pts/Q♥       0/10/25/50 pts
```

### Trick-Taking Rules (Rounds 1–3)
1. **Lead Suit Requirement:** The player sitting in the active leader seat plays any card to lead the trick.
2. **Must-Follow Rule:** Opponents holding cards of the led suit **MUST** play a card matching that suit. If void in the led suit, any card may be sluffed (discarded).
3. **Trick Evaluation:** The highest card of the led suit wins the trick. The winner takes the trick cards, receives any accumulated penalty points for that round, and sits in the leader seat for the next trick.

### Solitaire Dominoes Race Rules (Round 4)
1. **Starting Cards:** Sevens (`7-HEARTS`, `7-DIAMONDS`, `7-CLUBS`, `7-SPADES`) act as suit openers.
2. **Sequencing:** Once a 7 is placed on the board, adjacent cards can be played (6 descending towards 2, or 8 ascending towards Ace).
3. **Forced Pass:** If a player holds no legal playable cards on their turn, they must click **PASS**.
4. **Finishing Placement:** The first player to exhaust all 13 cards takes 1st place (0 pts), 2nd takes 10 pts, 3rd takes 25 pts, and 4th takes 50 pts.
