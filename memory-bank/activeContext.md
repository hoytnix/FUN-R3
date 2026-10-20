# Active Context: Current State & Active Focus

## Current Architectural Focus & Active State
The "Fuck Ur Neighbor" (F.U.N.) application has been refactored into a **100% Standalone Client-Side Single Page Application (SPA)** optimized for static HTML/JS export and GitHub Pages deployment. All remote database dependencies (Firebase Firestore, remote rules, online room session hooks) have been excised. The game runs entirely on local state, Single Player vs. AI Bots, and Pass & Play mode.

```
┌───────────────────────────────────────────────────────────────┐
│              100% STANDALONE CLIENT-SIDE SPA ARCHITECTURE     │
├──────────────┬──────────────────┬──────────────┬──────────────┤
│ AppViewRouter│ Single Player    │ Offline Pass │ Replay Engine│
│ & Home Page  │ Engine vs AI     │ & Play Mode  │ & Storage    │
│ (~200 LOC)   │ (~200 LOC)       │ (~250 LOC)   │ (IndexedDB)  │
└──────────────┴──────────────────┴──────────────┴──────────────┘
```

---

## Static Export & Standalone Conversion
- **Static Export Configured**: Next.js configured with `output: 'export'`, `trailingSlash: true`, and unoptimized images in `next.config.ts`.
- **Firebase Dependency Removed**: Deprecated `firebase` removed from `package.json`, along with `lib/firebase.ts`, Firestore rules, and remote session hooks.
- **Package Manager**: All dependency management and build operations utilize `pnpm`.
- **Game Modes**: Exclusively Single Player vs Bots and Local Pass & Play.

---

## Verification & Status
* **Compilation (`pnpm run build`):** PASSED clean with 0 errors; exported to static `out/` directory.
* **Linter (`pnpm run lint`):** PASSED clean with 0 warnings or errors.
* **Static Export:** Static pages prerendered into `/out` with `index.html`, `404.html`, and PWA service worker.
