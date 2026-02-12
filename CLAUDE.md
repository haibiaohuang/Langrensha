# CLAUDE.md - AI Assistant Guide for Langrensha (狼人杀笔记)

## Project Overview

**Langrensha** (狼人杀笔记 / Werewolf Game Notes) is a mobile-first Progressive Web App (PWA) for tracking Werewolf/Mafia game sessions. It allows players to record game configurations, track player roles and status, save game history locally, and optionally sync to the cloud via Supabase.

**Primary language:** Chinese (Simplified). All UI text, comments in early commits, and user-facing strings are in Chinese.

## Architecture

This is a **static single-page application** with no build system, bundler, or package manager. All files are served directly.

### File Structure

```
/
├── index.html           # Main HTML page (entry point, UI structure)
├── app.js               # All application logic (auth, game state, rendering, persistence)
├── styles.css           # All styling (dark theme, responsive, mobile-optimized)
├── manifest.json        # PWA manifest (app name, icons, display mode)
├── supabase_setup.sql   # Database schema for Supabase (game_history table, RLS policies)
└── CLAUDE.md            # This file
```

There are **no subdirectories** for source code. The entire application lives in these root-level files.

### Technology Stack

- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+) -- no frameworks
- **Backend:** Supabase (PostgreSQL + Auth), loaded via CDN
- **Dependencies (CDN only):**
  - `@supabase/supabase-js@2` -- authentication and database
  - Google Fonts (Noto Sans SC) -- Chinese typography
- **No npm, no package.json, no node_modules**

## Key Concepts

### Game Configurations (`GAME_CONFIGS` in app.js)

Games are defined by player count (9, 10, or 12) and board configuration (板子). Each config specifies:
- Wolf roles (wolf, white_wolf_king, wolf_beauty)
- God roles (seer, witch, hunter, guard)
- Number of villagers

### Roles (`ROLES` in app.js)

Each role has a name (Chinese), icon (emoji), short label, and camp affiliation (wolf/god/villager/unknown).

### State Management

- `players[]` -- array of player objects with id, role, camp, alive status, sheriff flag, and notes
- `selectedPlayerCount` -- 9, 10, or 12
- `selectedConfig` -- the chosen board configuration
- `hasSheriff` -- whether sheriff role is enabled
- `gameHistory[]` -- saved game records

### Panel Navigation

The app uses manual panel show/hide (no router). Panels: `authPanel`, `setupPanel`, `gameSection`, `historySection`. Only one is visible at a time, controlled by `showAuth()`, `showSetup()`, `showGame()`, `showHistory()` functions.

### Data Persistence

- **Local:** `localStorage` keys `werewolfGameState` and `werewolfHistory`
- **Cloud:** Supabase `game_history` table (requires authentication)
- Cloud sync is optional -- the app works fully offline with localStorage

### Authentication

- Email/password via Supabase Auth
- Google OAuth (redirect-based)
- Auth state changes trigger `updateAuthUI()` and cloud history loading
- Supabase client is initialized only if the SDK loaded successfully (graceful offline fallback)

## Development Workflow

### Running Locally

Open `index.html` directly in a browser, or serve with any static file server:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

No build step is needed. There is no compilation, transpilation, or bundling.

### Testing

There is **no automated test suite**. Testing is done manually in the browser. When making changes, verify:
- Game setup flow (select player count, config, start game)
- Player role/camp/status toggling
- Save/load game state (refresh page to test localStorage persistence)
- History save and view
- Auth flow (if Supabase is configured)

### Deployment

The app is designed for static hosting (e.g., GitHub Pages). Push changes to the appropriate branch and the site updates.

### Debug Mode

The app currently includes a debug alert on load (`app.js:2`). The `index.html` also includes fallback checks that alert if `app.js` fails to load.

## Code Conventions

### JavaScript

- Uses `var` for Supabase globals, `const` for constants, `let` for mutable state
- Functions are declared at module scope (no modules/imports)
- DOM manipulation is done via `document.getElementById()` and `innerHTML` with template literals
- Event handlers are attached via `onclick` attributes in HTML strings and `addEventListener` in `setupEventListeners()`
- Async/await for Supabase operations with try/catch error handling
- `alert()` is used for user-facing messages (Chinese text)

### CSS

- CSS custom properties (variables) defined in `:root` for theming
- Dark theme by default (`--bg: #0f0f1a`)
- Mobile-first responsive design with `@media (max-width: 480px)` breakpoint
- Safe area support for notched devices
- No CSS preprocessor (plain CSS)

### HTML

- Single `index.html` with all panels/sections
- Scripts loaded at bottom of `<body>`
- PWA meta tags in `<head>`

### Commit Messages

The repository uses a mix of English and Chinese commit messages. Recent commits are in English, earlier ones in Chinese. Keep commit messages concise and descriptive.

## Database Schema

The Supabase database has one table (`supabase_setup.sql`):

**`game_history`** -- stores saved game sessions
- `id` (UUID, PK)
- `user_id` (UUID, FK to auth.users)
- `config_name` (text)
- `player_count` (int)
- `has_sheriff` (boolean)
- `players` (JSONB -- full player state array)
- `notes` (text)
- `wolves`, `good`, `alive` (int -- summary stats)
- `created_at` (timestamptz)

Row-Level Security (RLS) is enabled: users can only select, insert, and delete their own records.

## Important Notes for AI Assistants

- **No build system:** Do not suggest adding webpack, Vite, or similar tooling unless explicitly requested. Changes take effect immediately.
- **No package manager:** Do not reference `npm install` or `package.json`. External libraries are loaded via CDN `<script>` tags in `index.html`.
- **All-in-one files:** `app.js` contains all JS logic. `styles.css` contains all styles. Do not split into modules unless requested.
- **Chinese UI:** All user-facing strings (alerts, labels, placeholders) must be in Simplified Chinese.
- **Supabase credentials are public:** The anon key in `app.js` is a client-side public key. This is normal for Supabase. Do not treat it as a leaked secret.
- **PWA icons referenced but missing:** `icon-192.png` and `icon-512.png` are referenced in `manifest.json` and `index.html` but do not exist in the repo.
- **Debug artifacts:** `app.js:2` contains a debug alert that fires on every page load. This should be removed for production use.
- **Inline HTML generation:** Player rows and config items are rendered by building HTML strings with template literals. Be careful with XSS -- use the `escapeHtml()` function for user-provided content.
