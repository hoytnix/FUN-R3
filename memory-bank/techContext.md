# Tech Context: Tech Stack & Environment Constraints

## Core Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js 15 App Router                   │
│                       React 19 + TypeScript                 │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│       Tailwind CSS v4        ││       Framer Motion          │
│    tw-animate-css + Lucide   ││       (motion/react)         │
└──────────────────────────────┘└──────────────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐┌──────────────────────────────┐
│      Firebase Firestore      ││       Web Audio Engine       │
│    @google/genai SDK v2      ││     canvas-confetti v1.9     │
└──────────────────────────────┘└──────────────────────────────┘
```

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Next.js** | `^15.4.9` | Core App Router framework, SSR entry, API routes. |
| **React** | `^19.2.1` | UI Component rendering engine. |
| **TypeScript** | `5.9.3` | Strict type safety across game engine & state models. |
| **Tailwind CSS** | `4.1.11` | Utility-first styling & layout system via PostCSS. |
| **Motion** | `^12.23.24` | Card movement, fling animations, layout transitions. |
| **Firebase SDK** | `^12.16.0` | Real-time document listener & room synchronization (`firestore`). |
| **Canvas Confetti**| `^1.9.4` | Victory particle overlay effects. |
| **Lucide React** | `^0.553.0` | UI vector icons. |

---

## Environment & Infrastructure Constraints

### 1. Port & Network Requirements
* **Port 3000:** The container runs behind an Nginx reverse proxy routing traffic exclusively to port `3000`.
* **Zero HMR Injections:** Platform configuration disables HMR (`DISABLE_HMR=true`) for stable iterative builds.

### 2. Standalone PWA & Offline Caching
* **Manifest Config (`/public/manifest.json`):**
  * `display: "standalone"`
  * `orientation: "portrait"`
  * `theme_color: "#0f172a"` (Slate-900)
  * `background_color: "#020617"` (Slate-950)
* **Touch Optimization:** Touch targets enforced at $\ge 44\text{px}$ with `touch-action: manipulation` applied to card containers to eliminate 300ms tap delay.

### 3. Local Storage Persistence Keys

| Key | Purpose | Storage Scope |
| :--- | :--- | :--- |
| `FUN_OFFLINE_SESSION` | Offline Pass & Play game state serialization (`OfflineGameState`). | `localStorage` |
| `FUN_MATCH_HISTORY` | Array of completed `MatchRecord` logs (capped at 20 matches). | `localStorage` |
| `fun_roomCode` | Active online room code cache for auto-reconnection on page refresh. | `localStorage` |

---

## Security & Database Rules

### Firestore Security Rules (`firestore.rules`)
```cel
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true;
    }
  }
}
```

### Realtime DB Rules (`database.rules.json`)
* Validates room creation host ID (`auth.uid === newData.child('hostId').val()`).
* Enforces structural schema validation on card plays (`suit in ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES']`, `value in [2..14]`).
* Restricts turn updates to the active seat player or room host.
