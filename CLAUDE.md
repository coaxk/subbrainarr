# SubBrainArr — The Dashboard That Gives Subgen a Brain

## What This Is
Configuration dashboard for Subgen (AI subtitle generator). React frontend + FastAPI backend + SQLite.
Provides hardware-aware language tuning, Docker volume auto-detection, and guided setup.

## Stack
- **Backend:** Python 3.11, FastAPI, SQLite, port 9918
- **Frontend:** React + Vite + Tailwind CSS, port 5918 (dev)
- **No tests yet** — manual testing via browser

## Architecture

### Backend (`backend/`)
| File | Purpose |
|------|---------|
| `main.py` | FastAPI app, CORS, WebSocket, router registration |
| `routers/connection.py` | Subgen connection testing + status |
| `routers/hardware.py` | GPU/CPU detection for Whisper recommendations |
| `routers/languages.py` | **Single source of truth** — 58 languages with per-family Whisper tuning params |
| `routers/tuning.py` | Per-language tuning config, reset, "Apply Recommended Defaults" |
| `routers/settings.py` | Settings persistence (settings.json) |
| `routers/scanning.py` | Folder scanning via Subgen's `POST /batch?directory=<path>` API |
| `routers/docker.py` | Docker SDK for container logs via socket mount |
| `routers/logs.py` | Log streaming |
| `routers/github.py` | GitHub release checking |
| `routers/community.py` | Community profile sharing |
| `url_validation.py` | **Shared SSRF prevention module** — validates all user-supplied URLs |

### Frontend (`frontend/src/`)
| Component | Purpose |
|-----------|---------|
| `App.jsx` | Main layout, 4-tab navigation, `handleNavigate({tab, subTab})` |
| `ConnectionScreen.jsx` | Subgen connection setup, bundled/standalone explainer |
| `LanguageCards.jsx` | Language browser, family accordion (8 groups), flag display |
| `LanguageTuningWizard.jsx` | Per-language Whisper parameter tuning |
| `HardwareCard.jsx` | GPU/CPU detection display |
| `RecommendationsCard.jsx` | Tuning recommendations with `ACTION_NAV` deep-linking |
| `SmartScan.jsx` | Folder scanning interface |
| `SettingsPanel.jsx` | Settings management |
| `LogsViewer.jsx` | Real-time log display |

### API Routes
| Prefix | Purpose |
|--------|---------|
| `/api/connection` | Subgen connectivity |
| `/api/hardware` | Hardware detection |
| `/api/languages` | Language data (58 langs, 8 families) |
| `/api/tuning` | Tuning config CRUD |
| `/api/settings` | Settings persistence |
| `/api/scanning` | Batch subtitle scanning |
| `/api/docker` | Container log access |
| `/api/github` | Release info |
| `/api/community` | Community profiles |

## Key Patterns

### Tab Navigation + Deep-Linking
`handleNavigate({tab, subTab})` in App.jsx, `pendingSubTab` + `onSubTabConsumed` for cross-tab deep-linking. `ACTION_NAV` map in RecommendationsCard drives navigation from recommendation cards to specific tabs/subtabs.

### Language Data
Single source of truth in `backend/routers/languages.py`. 58 languages across 8 families with per-family Whisper tuning parameters (Subgen parity + Bengali). Flags via `flagcdn.com` using country code map in LanguageCards.jsx (not emoji).

### Tuning State
Persisted via `settings.language_configs` in `settings.json`. `get_tuned_languages()` derives from persisted data. `POST /tuning/reset` removes per-language tuning.

### Security
- `url_validation.py` — shared SSRF prevention for all user-supplied URLs
- Locked CORS origins
- Pinned dependencies

## Gotchas
- **Startup:** venv at `backend/venv` has stale shebang; use system `python` instead
- **Scanning:** Uses real Subgen `POST /batch?directory=<path>` API — needs running Subgen instance
- **Docker logs:** Requires Docker socket mount for container log access
- **`nul` file:** Stale Windows artifact in repo root — safe to delete

## Running
```bash
# Backend
cd backend && python main.py

# Frontend (dev)
cd frontend && npm run dev

# Docker
docker compose up --build
```

## Session Discipline
**Before every commit and at end of session**, update knowledge files:
1. This `CLAUDE.md` — architecture, patterns, gotchas, key functions
2. Global `MEMORY.md` (at `~/.claude/projects/C--DockerContainers/memory/MEMORY.md`) — cross-project state, user prefs, ecosystem strategy
Do this proactively. Don't wait to be asked. If you built it, document it.

## Ecosystem Strategy
Part of a 4-tool ecosystem: MapArr, ComposeArr, SubBrainArr, Apart.
Shared code extraction planned for Phase 15+ into a `shared/` directory.
Cross-Claude communication via CLAUDE.md files and comprehensive code comments.
**Rumplestiltskin** — banked framework concept: extract ethos + methodology into pluggable analysis engine.
