# System Patterns: Architecture & State Machines

## State Machine Matrix

The game engine operates on a strict finite state machine defined in `lib/types.ts`:

```
┌─────────────────┐
│  LOBBY_WAITING  │ ◄── Host creates room / players join
└────────┬────────┘
         │ Host starts game
         ▼
┌─────────────────┐
│   DEAL_HANDS    │ ◄── Deck shuffled (Fisher-Yates) & hands distributed (13 cards)
└────────┬────────┘
         │ Hands dealt
         ▼
┌─────────────────┐
│   PLAYER_TURN   │ ◄── Active seat plays legal card or passes (Round 4)
└────────┬────────┘
         │ 4 cards played in trick (R1-3) OR Round 4 hand cleared
         ├─── (Trick complete) ──────► ┌──────────────────┐
         │                            │TRICK_EVALUATION  │
         │                            └────────┬─────────┘
         │                                     │ Winner evaluated & points updated
         │ ◄───────────────────────────────────┘
         │
         │ All 13 tricks complete OR Solitaire all players finished
         ▼
┌─────────────────┐
│    ROUND_END    │ ◄── Round scores finalized; advance to Round R+1
└────────┬────────┘
         │ Round 4 completed
         ▼
┌─────────────────┐
│    GAME_OVER    │ ◄── Final total scores calculated; winner declared
└─────────────────┘
```

---

## Real-Time Synchronization Pattern (Firebase Host Authority)

Online multiplayer relies on a **Host Authority Model** using Firebase Firestore (`rooms/{roomId}`) supported by Realtime rules (`database.rules.json` & `firestore.rules`):

```
+───────────────────────+           +────────────────────────+
|   Host Client (Seat 0)|           |  Remote Clients (1-3)  |
+───────────┬───────────+           +───────────┬────────────+
            │                                   │
            │ Write room state update           │ Read-only snapshot
            ▼                                   ▼
+────────────────────────────────────────────────────────────+
|                Firebase Firestore / Realtime DB            |
|                   Doc: rooms/{roomCode}                    |
+────────────────────────────────────────────────────────────+
```

1. **Host Authority:** The room host (creator) processes turn timeouts, evaluates trick winners, applies AI bot actions, and writes state transitions to Firestore.
2. **Atomic Action Execution:** Non-host players submit card plays via `updateDoc` calls. The host listener picks up card plays, validates trick completeness, and executes state updates.
3. **Optimistic UI & Reconnection:** Local room state is mirrored in React state via `onSnapshot`. Local session token (`fun_roomCode`) persists room membership across browser reloads.

---

## Component Architecture & Visual Engines

### 1. Vector Card Rendering Engine (`/components/ui/PlayingCard.tsx`)
* **Pure SVG Pip Matrix (`CardPipMatrix.tsx`):** Renders playing cards dynamically without external image dependencies.
* **Responsive Scaling:** Supports suit colors (Red for Hearts/Diamonds, Dark Charcoal for Clubs/Spades), custom corner rank labels, and face card art placeholders.

### 2. Motion & Animation Integration (`motion/react`)
* **Deal Fling Animations:** Cards animate smoothly from table center to player hand slots.
* **Trick Fling & Sweep:** Played cards slide into table center slots and sweep towards the winning seat upon trick resolution.
* **Confetti Celebration (`canvas-confetti`):** Triggered upon match completion for the low-score winner.

### 3. State Management Hooks & Utilities
* `hooks/useOfflineGameSession.ts`: Manages offline Pass & Play game state, privacy hand shield toggling, and turn transitions.
* `lib/offline-engine.ts`: Pure local state manager handling offline Pass & Play state transitions without network calls.
* `lib/rules/single-player-engine.ts`: Initializes and manages single-player room state vs 3 bot seats.
* `lib/replay-logger.ts`: Captures step-by-step game actions with 32-bit FNV-1a state hashes (`computeStateHash`).

---

## Replay Logger State Hash Architecture

To ensure deterministic replay validation, `lib/replay-logger.ts` computes an 8-character hex checksum string for every step:

$$\text{rawString} = \text{Round} \mid \text{ActiveSeat} \mid \text{SortedHands} \mid \text{TrickCards} \mid \text{SolitaireBoard} \mid \text{Scores}$$

$$\text{Hash}_{\text{FNV-1a}} = \text{FNV32}(\text{rawString})$$

This checksum guarantees state consistency during match replay playback in `MatchHistoryModal.tsx`.
