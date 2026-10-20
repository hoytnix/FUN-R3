# 🖕 FU*K UR NEIGHBOR (F.U.N.)

<div align="center">

[![Live Demo](https://img.shields.io/badge/PLAY_NOW-GitHub_Pages-ff0055?style=for-the-badge&logo=googlechrome&logoColor=white)](https://hoytnix.github.io/FUN-R3/)
[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232a?style=for-the-badge&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**The cutthroat, zero-latency 4-player trick-taking mobile card game & Solitaire speed race.**  
*Trump is a trap. Tricks are toxic. Lowest score walks away alive.*

[**🎮 Play Live in Browser**](https://hoytnix.github.io/FUN-R3/) • [**📖 Game Rules**](#-the-4-brutal-rounds) • [**🤖 AI Bot Engine**](#-ai-engine--card-counting) • [**⚡ Architecture**](#-technical-architecture--badassery) • [**🚀 Quickstart**](#-quickstart--local-development)

---

</div>

## 💥 What is F.U.N.?

Standard card games coddle you for winning tricks and hoarding face cards.  
**FU*K UR NEIGHBOR (F.U.N.) flips the table upside down.**

In F.U.N., **every trick you take is a liability**. Strategy is purely offensive sabotage: bleed your neighbors with radioactive Hearts, bait their highest cards into the penalty zone, and survive long enough to blaze through the Round 4 Solitaire dominoes sprint.

Built from the ground up as a **100% client-side standalone Progressive Web Application (PWA)** by **[TehWiz Productions](https://tehwiz.com)**, F.U.N. delivers zero-latency gameplay, browser-native procedural sound synthesis, cutthroat AI bots with card counting, and full offline Pass & Play support on any device.

---

## 🃏 The 4 Brutal Rounds

Every match consists of 4 distinct rounds played with a standard 52-card deck (13 cards dealt per player).  
**Goal: Finish all 4 rounds with the absolute LOWEST point total.**

```
[ DEAL 13 CARDS EACH ]
          │
          ▼
    ┌───────────┐         ┌───────────┐         ┌───────────┐         ┌───────────┐
    │  ROUND 1  │ ──────► │  ROUND 2  │ ──────► │  ROUND 3  │ ──────► │  ROUND 4  │
    │  Hearts   │         │Royal Suite│         │Queen Death│         │ Solitaire │
    └───────────┘         └───────────┘         └───────────┘         └───────────┘
      +5 pts / ♥          +15 pts / J,Q,K♥       +50 pts / Q♥        0 / 10 / 25 / 50 pts
   (Trick-Taking)        (High-Card Trap)       (Sudden Death)        (Speed Hand Race)
```

| Round | Name | Type | Penalty & Rules | Winning Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Hearts ♥** | Trick-Taking | **+5 pts** per Heart captured. Must follow lead suit if held. | Duck under high leads; sluff Hearts onto whoever is forced to take the trick. |
| **2** | **Royal Suite 👑** | Trick-Taking | **+15 pts** per Heart Face Card (`J♥`, `Q♥`, `K♥`). | High cards become ticking bombs. Bait high face cards out early when safe. |
| **3** | **Queen Sudden Death 💀** | Trick-Taking | **+50 pts** flat penalty to whoever captures the Queen of Hearts (`Q♥`). | Religiously track the Queen. If you hold it, dump it on an off-suit trick led by an opponent. |
| **4** | **Solitaire Race 🏎️** | Hand-Shedding | **Dominoes race!** 7s open foundations; build up to Ace/King or down to 2/Ace. 1st out: **0 pts**, 2nd: **10 pts**, 3rd: **25 pts**, 4th: **50 pts**. | Hoard blocking cards to force opponents to **PASS** and dump your chains first. |

---

## 🕹️ Game Modes

### 1. 🤖 Single Player vs. AI Bots
Jump into instant combat against 3 heuristic bots (`Chip AI`, `Byte Bot`, `Neo Bot`, etc.).
- **Easy**: Casual play with minimal card tracking.
- **Medium**: Strictly respects suit voids and ducks obvious high penalties.
- **Hard**: Full **card-counting memory array** (`lib/card-memory.ts`). Tracks every card played across all suits, detects opponent voids, calculates high-card probability, and maximizes neighbor penalty bleed.
- **Bot Personalities**: `CASUAL` (60s timer), `CUTTHROAT` (20s aggressive dump), `CHAOS` (unpredictable leads).

### 2. 🛡️ Local Pass & Play (100% Offline)
Turn your phone or tablet into a shared felt battleground for 4 physical players:
- **PassShield Privacy Overlay** (`components/PassShield.tsx`): Automatically obscures hand data between player turns with a frosted backdrop and confirmation trigger to eliminate shoulder-surfing.
- **Zero Server Dependency**: 100% offline persistence stored in `localStorage` (`FUN_OFFLINE_SESSION`).

### 3. 🎓 Interactive Guided Sandbox
First time getting wrecked? Jump into the 4-step interactive onboarding tutorial (`components/tutorial/OnboardingSandbox.tsx`). Features live action-locking that guides you through leading suits, penalty sluffing, and Solitaire board manipulation.

---

## ⚡ Technical Architecture & Badassery

F.U.N. was engineered to run lightning-fast on mobile devices without relying on slow remote servers, databases, or bloated media assets:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FU*K UR NEIGHBOR (F.U.N.)                       │
│                        Next.js 15 Client-Side SPA                      │
├───────────────────────────────────┬────────────────────────────────────┤
│           Core Game Layer         │           Audio & Voice UX         │
│  • game-engine.ts (Deterministic) │  • Web Audio API Synthesizer       │
│  • bot-engine.ts & card-memory.ts │  • Web SpeechSynthesis Taunts      │
│  • solitaire-rules.ts             │  • Dynamic Play-by-Play Announcer  │
├───────────────────────────────────┼────────────────────────────────────┤
│         Persistence & Replay      │             PWA & Shell            │
│  • 32-bit FNV-1a State Hashes     │  • Service Worker (sw.js) Cache   │
│  • Step-by-Step Replay Logger     │  • Mobile Portrait Lock Guard      │
│  • Match History Inspection Modal │  • Touch Manipulation Target Fix   │
└───────────────────────────────────┴────────────────────────────────────┘
```

- **Zero-Asset Procedural Audio Synth (`lib/audio.ts`)**:  
  No heavyweight audio files. Custom procedural Web Audio oscillators synthesize crisp card dealing snaps, trick sweeps, Solitaire passes, error buzzers, and victory fanfares directly in memory.
- **Offline Voice Commentary & Savage Taunts (`lib/audio-taunts.ts` / `lib/commentator-engine.ts`)**:  
  Native browser `speechSynthesis` engine drives an animated, reactive play-by-play commentator and spicy bot taunts when a player takes massive penalty hits or gets trapped in a pass loop.
- **Cryptographic Match Replay Engine (`lib/replay/`)**:  
  Every card dealt, played, and passed is logged with a 32-bit FNV-1a checksum. Review any previous game turn-by-turn with all 4 hands exposed in the full-fidelity Match History inspector.
- **Offline PWA with Service Worker (`public/sw.js`)**:  
  Instant load with Network-First and Stale-While-Revalidate caching strategies. Add to mobile Home Screen for a native fullscreen experience.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (Static HTML/SPA Export mode)
- **UI Engine**: [React 19](https://react.dev/) + [TypeScript 5.9](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with custom poker-felt colors and responsive touch ergonomics
- **Animation**: [Motion](https://motion.dev/) (Framer Motion 12) for smooth 60fps card fling physics and board transitions
- **Icons & Visuals**: [Lucide React](https://lucide.dev/) + Canvas Confetti
- **Deployment**: [GitHub Actions](https://github.com/features/actions) ➔ [GitHub Pages](https://pages.github.com/)

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: `22.x` or higher
- **pnpm**: `v12.x` or higher (recommended)

### 1. Clone the Repo
```bash
git clone https://github.com/hoytnix/FUN-R3.git
cd FUN-R3
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Start Development Server
```bash
pnpm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser (or use responsive device mode for the mobile experience).

### 4. Build Static Export (GitHub Pages Ready)
```bash
pnpm run build
```
Generates an optimized static SPA output inside the `/out` directory.

### 5. Run Linter
```bash
pnpm run lint
```

---

## 📁 Project Structure

```
FUN-R3/
├── app/
│   ├── layout.tsx         # Metadata, SEO, PWA headers, JSON-LD Schema
│   ├── page.tsx           # Top-level client SPA router & state orchestrator
│   └── globals.css        # Tailwind 4 styles, felt-table palette, mobile touch rules
├── components/
│   ├── game/              # In-game table, control panel, confetti, game-over overlays
│   ├── modals/            # Match history, replay viewer, settings, rules dialog
│   ├── tutorial/          # Interactive 4-step onboarding sandbox
│   ├── ui/                # High-fidelity playing cards, avatar selector, emoji picker
│   └── views/             # HubView, SinglePlayerSetup, OfflineSetup, Router
├── lib/
│   ├── audio.ts           # Web Audio API sound synthesizer
│   ├── audio-taunts.ts    # Web SpeechSynthesis voice taunts & commentator voice
│   ├── bot-engine.ts      # AI heuristic bot logic, difficulty tiers & pacing
│   ├── card-memory.ts     # Advanced card-counting memory array for Hard AI
│   ├── game-engine.ts     # Deck generation, shuffling, hand evaluation
│   ├── offline/           # Offline Pass & Play state machine & local storage
│   ├── replay/            # FNV-1a checksum hasher & match history storage
│   ├── rules/             # Round 1-3 trick evaluator & Round 4 Solitaire validator
│   └── types.ts           # Game state, player, suit, card & round types
├── public/
│   ├── manifest.json      # Mobile PWA manifest
│   ├── sw.js              # Offline caching service worker
│   ├── robots.txt         # Optimized crawler rules
│   └── llms.txt           # LLM agent context & game specification
└── .github/workflows/
    └── deploy.yml         # Automated GitHub Pages static build & deploy workflow
```

---

## 👥 Credits & Studio

- **Produced & Developed by**: **[TehWiz Productions](https://tehwiz.com)**
- **Creator**: Michael Hoyt ([@hoytnix](https://github.com/hoytnix))
- **Live Deployment**: [https://hoytnix.github.io/FUN-R3/](https://hoytnix.github.io/FUN-R3/)
- **Repository**: [https://github.com/hoytnix/FUN-R3](https://github.com/hoytnix/FUN-R3)

---

## 📜 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
