# Changelog

All notable changes to Flowora are documented in this file.

---

## [3.5.0] - 2026-08-24

### Added
- **Onboarding** first-run tour (tasks → focus → backup)
- **Review** page: daily metrics, completed/open lists, habit gaps, insight CTAs
- **Browser reminders** (Settings → Reminders): focus end, evening habits, optional midday tasks
- **Day templates**: Morning routine, Work deep-work, Student day
- **Keyboard shortcuts** panel (`?`) + `G` then letter navigation, `N` / `T`
- **Tags + recurring tasks** on Home (daily / weekdays / weekly)
- **Built by KRIXORA** credit in sidebar (icon + link to portfolio)
- SEO: JSON-LD WebApplication, updated meta, `robots.txt`, `sitemap.xml`
- WebP app icons + OG `preview.webp` (1200×630); PNG kept only for apple-touch-icon

### Changed
- Home UI simplified: fewer filters (dropdowns), guide collapsed by default
- Sidebar grouped: Home / Plan / Focus / Grow
- Responsive drawer + backdrop; safe-area support
- Progress ring geometry fixed (full circle + centered label)

### Fixed
- Mobile “blurred until click” (scroll-reveal opacity:0 removed)
- Progress ring mismatch (stroke-dasharray vs radius)
- Redundant PNG assets removed where WebP is used

---

All notable changes to Flowora will be documented in this file.

The format is based on Keep a Changelog.

---

## [3.2.1] - Polish & Bugfix

### Fixed
- Duplicate `export` statements in `storage.js` and `utils.js` (broke ES module parse)
- Missing `handleLocaleChange` / `handleCreateTeam` / `refreshTeamsHint` method bodies in Settings
- `ThemeManager` now imports `StorageManager` (ES module scope fix)
- Goals emit `goalComplete` plugin hook at 100% progress

---

## [3.2.0] - Phase 5: Scale & Advanced Foundations

### Added
- **i18n** system with English + Hindi (`src/js/i18n/`)
- Language selector in Settings
- **Teams** scaffolding (`TeamsManager` + `supabase/teams-schema.sql`)
- **Google Calendar** hooks: `.ics` export (works offline) + OAuth config detection
- **Plugin registry** with hooks (`on`, `emit`) + built-in celebration plugin
- **Capacitor** config (`capacitor.config.json`) for future Android/iOS packaging
- Settings → Language & Integrations card (locale, ICS, Google Calendar, create team)

### Notes
- Teams require Phase 3 Supabase + running `teams-schema.sql`
- Two-way Google Calendar sync still needs Google Cloud OAuth client + backend token exchange
- Mobile: `npm run build` then Capacitor CLI (`npx cap add android`)

---

## [3.1.0] - Phase 4: Security, AI & Polish

### Added
- **AI rate limiting** (15 requests / minute client-side)
- Richer AI workspace context (tasks, habits, goals summary)
- AI actions: **add habit**, **add goal** (in addition to tasks)
- **Auto local snapshots** (ring buffer of last 5, every ~6 hours)
- Settings → **Snapshot** restore from last automatic backup
- Accessibility: skip-to-content link, reduced-motion support, icon-button `aria-label`s
- `redactSecrets()` helper for safe logging/exports

### Security
- Cloud sync **strips `aiApiKey`** before upload (never stored in Supabase workspace JSON)
- Auto-snapshots also redact API keys

### Changed
- Local AI fallback replies are more useful (briefs, habit/goal lists)

---

## [3.0.0] - Phase 3: Backend, Auth & Cloud Sync

### Added
- **Supabase integration** (optional — app still works fully offline)
- Email/password + Google OAuth auth (`AuthManager`)
- Cloud workspace sync with last-write-wins (`SyncManager`)
- Settings → **Account & Cloud Sync** card (sign in / sign up / sync now)
- AI **server proxy** helper (`aiProxy.js`) so Gemini keys stay off the client
- Example Supabase Edge Function (`supabase/ai-proxy-edge-function.ts`)
- SQL schema + RLS policies (`supabase/schema.sql`)
- `.env.example` for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_AI_PROXY_URL`

### Security
- Row Level Security: users can only access their own workspace
- Prefer AI proxy over client-side API keys

### Setup
1. Create free project at https://supabase.com
2. Run `supabase/schema.sql` in SQL Editor
3. Copy `.env.example` → `.env` and fill keys
4. `npm install && npm run dev`
5. (Optional) Deploy AI proxy edge function and set `GEMINI_API_KEY` secret

---

## [2.2.0] - Phase 2: Architecture Upgrade

### Added
- **Vite** build toolchain (`npm run dev` / `npm run build`)
- Modern `src/` folder structure:
  - `src/js/core/` — storage, router, theme
  - `src/js/features/` — dashboard, planner, goals, habits, etc.
  - `src/js/shared/` — utils, components
  - `src/tests/` — Vitest unit tests
- ES Module imports/exports across all modules
- Unit tests for StorageManager and Utils
- `jsconfig.json` for better editor IntelliSense
- `public/` for static PWA assets (icons, manifest, service worker)

### Changed
- Single entry point: `src/js/main.js` (replaces 15 sequential script tags)
- `index.html` loads one `<script type="module">`
- Legacy `assets/js/` kept for reference / non-Vite fallback

### Developer experience
```bash
npm install
npm run dev      # local development server
npm run build    # production build → dist/
npm test         # run unit tests
```

---

## [2.1.0] - Phase 1: Production Foundations

### Added
- Full **Import / Restore** backup (JSON) in Settings — previously only Export existed
- Storage health indicator (keys count + approximate size)
- Global error + unhandled promise rejection handlers
- Storage quota warning when localStorage is full
- Gentle backup reminder if no export in last 14 days
- Centralized `Utils` helpers (escapeHTML, debounce, safeJSONParse, uid, timeAgo)
- `StorageManager.exportAll()` / `importAll()` / `healthCheck()` APIs
- Schema versioning metadata in backups

### Changed
- Toasts now always escape HTML (XSS protection)
- Reset data now only clears `lifeflow_*` keys (safer)
- StorageManager more resilient with better fallbacks and quota detection
- All modules now delegate `sanitizeHTML` to central `Utils.escapeHTML` (no duplicated implementations)
- Dashboard empty state messages clarified
- Service worker cache bumped to v4
- `.gitignore` restored to proper filename

### Security
- XSS hardening on toast messages, notifications, and all module render paths
- Single source of truth for HTML escaping

---

## [2.0.0] - General User Release

### Added
- Real search across tasks, goals, habits, and planner items (Ctrl/Cmd+K)
- Undo action after deleting tasks/items
- Live, event-driven notification center (task completed, goal reached 100%,
  habit streak milestones, Pomodoro session end) — no longer static/demo data
- AI Assistant confirmed fully functional, including optional voice input
  (via browser speech recognition) and optional Gemini API key for smarter replies

### Changed
- Rebranded Settings page from a developer-portfolio config panel to a
  simple Profile / AI Assistant / Data Backup screen
- Replaced all developer-themed default/seed data (goals, habits, planner
  tasks, dashboard tasks, calendar events) with general, everyday examples
- Removed "Enterprise / Matrix / Telemetry / Architecture / Deliverable"
  style jargon from toasts, headings, labels, and placeholders app-wide
- App scripts now run as plain scripts instead of ES6 modules, so the app
  works correctly when index.html is opened directly (file://) without a
  local server

### Fixed
- Notification badge and dashboard greeting no longer flash incorrect
  placeholder values (hardcoded "3", "Architect", "94%") before real data
  loads
- Mobile responsive layout issues across calendar, modals, and dashboard

---

## [1.0.0] - Initial Release

### Added
- Initial production release
- AI-powered productivity dashboard
- Goal management system
- Habit tracker
- Daily planner
- Calendar module
- Analytics dashboard
- Pomodoro timer
- Settings management
- Dark & Light theme
- Responsive user interface
- Progressive Web App (PWA)
- Local data persistence

---

## Upcoming

Planned features for future releases:

- Cloud Synchronization
- User Authentication
- AI-generated Analytics Reports (beyond current rule-based insights)
- Google Calendar Integration
- Native Mobile Application (Android / iOS)
