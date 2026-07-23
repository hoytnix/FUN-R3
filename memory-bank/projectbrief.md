# Project Brief: "Fuck Ur Neighbor" (F.U.N.) Card Game PWA

## Overview & Identity
**"Fuck Ur Neighbor" (F.U.N.)** is a fast-paced, high-stakes 4-player trick-taking mobile card game Progressive Web Application (PWA). Unlike traditional card games where capturing tricks earns rewards, F.U.N. is fundamentally a **low-point avoidance game**. Trump is a liability, penalty cards accumulate rapidly, and the player with the lowest score at the end of four distinct rounds wins the match.

---

## High-Level 4-Round Structure

| Round | Title | Core Mechanic & Scoring |
| :--- | :--- | :--- |
| **Round 1** | **Hearts** | Standard trick-taking. **+5 points** per Heart taken in a trick. Following lead suit is mandatory if held. |
| **Round 2** | **Royal Suite** | High-card trap. **+15 points** per Heart Face Card (Jack, Queen, King) captured in a trick. |
| **Round 3** | **Queen of Hearts Sudden Death** | Maximum risk. **+50 points** penalty awarded to the player who captures the Queen of Hearts (`HEARTS-12`). Massive score swing round. |
| **Round 4** | **Around The World Solitaire** | Dominoes-style card race! No trick-taking. Building suit sequences starting with 7s (ascending to Ace, descending to 2). **1st to clear hand = 0 pts**, **2nd = 10 pts**, **3rd = 25 pts**, **4th = 50 pts**. Mandatory PASS if no valid move exists. |

---

## Operational Game Modes

1. **Online Multiplayer**
   * Real-time synchronization powered by Firebase Firestore (`rooms/{roomId}`) with host-authority trick resolution.
   * Supports human-only rooms or mixed human + heuristic AI bot seats.
   * Room code creation, join codes, turn timer deadlines, and real-time chat/emoji reactions.

2. **Single-Player (vs 3 Heuristic AI Bots)**
   * Instant local or client-driven match against 3 AI opponents (`bot_seat_1`, `bot_seat_2`, `bot_seat_3`).
   * Configurable difficulty levels (`EASY`, `MEDIUM`, `HARD`) and personalities (`CASUAL`, `CUTTHROAT`, `CHAOS`).
   * Card-counting memory engine (`lib/card-memory.ts`) utilized by higher difficulty bots.

3. **Local Pass & Play (Offline Mode)**
   * Single-device 4-player support with zero internet connection required.
   * Integrated **PassShield Privacy Overlay** (`PassShield.tsx`) to conceal hand contents between player turns.
   * Full session persistence stored in `localStorage` (`FUN_OFFLINE_SESSION`).

---

## Primary Architectural Goals
* **Zero Latency Touch UX:** Responsive ergonomics tailored for mobile portrait screens (`touch-action: manipulation`).
* **Deterministic Replay Integrity:** Every match logs state transitions using 32-bit FNV-1a state hashes for post-game inspection and match history replay.
* **Resilient Offline Shell:** Service Worker caching allowing standalone app launch and full offline Pass & Play execution.
