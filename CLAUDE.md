# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Langrensha (狼人杀笔记) is a PWA-based Werewolf game tracking notebook. It allows players to track roles, status, camps, and notes during Werewolf (Mafia-variant) games. The app supports offline play with localStorage and optional cloud sync via Supabase authentication.

**Live site**: Hosted on GitHub Pages.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 with custom properties
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **SDK**: Supabase JS v2 loaded via CDN (no npm/bundler)
- **PWA**: manifest.json for installable app, portrait-only

## Development

This is a static site with **no build system, no package manager, no tests, no linter**. All code lives in three files:

- `index.html` — page structure, CDN script tags
- `app.js` — all application logic (~590 lines)
- `styles.css` — all styles with CSS variables (~800 lines)

To develop: open `index.html` in a browser or serve with any static file server. No compilation or install step required.

## Architecture

### Data Flow
```
Browser UI (index.html)
    ↓
app.js (all logic)
    ├→ localStorage (offline, always available)
    └→ Supabase Cloud (when authenticated)
```

### View System
Single-page app with four view panels toggled via JS (no URL routing):
- **Auth Panel** — login/register (email+password, Google OAuth)
- **Setup Panel** — pick player count (9/10/12) and game config variant
- **Game Section** — active game with player role/camp/status tracking
- **History Section** — past games from local + cloud, merged

### Game Configurations (GAME_CONFIGS constant)
Predefined role distributions for 9, 10, and 12 player games with variants (Standard, Wolf Beauty, Guard, White Wolf King, Double). Each config defines exact role counts.

### Key Roles & Camps
- **Wolf camp** (红色/red): 狼人, 狼美人, 白狼王
- **Good camp** (绿色/green): 预言家, 女巫, 猎人, 守卫, 村民
- Camp auto-detected from role via `getCampForRole()`

### Authentication & Cloud Sync
- Supabase anon key is a public key (safe to expose, protected by RLS)
- `game_history` table schema in `supabase_setup.sql`
- RLS policies restrict users to their own records only
- History saves attempt cloud first, falls back to localStorage on failure
- Cloud games marked ☁️, local games marked 📱

### State Persistence
- `saveGameState()` / `loadGameState()` — current game to localStorage
- `saveToHistory()` — completed games to cloud or localStorage (max 20 local)
- Game notes auto-save with 500ms debounce

## Important Patterns

- **Offline-first**: Everything works without authentication or internet
- **All UI in Chinese**: Role names, labels, buttons are in Chinese
- **Mobile-first CSS**: Safe area insets for notched phones, 480px breakpoint, touch-optimized
- **Dark theme**: CSS variables prefixed `--bg`, `--text`, `--accent`, `--wolf`, `--good`
- **XSS prevention**: `escapeHtml()` used for user-provided text
- **Global error handler**: `window.onerror` catches uncaught JS errors

## Database Schema (supabase_setup.sql)

`game_history` table: id (UUID), user_id (FK), config_name, player_count, has_sheriff (bool), players (JSONB), notes, wolves/good/alive counts, created_at. Row-level security enforced.
