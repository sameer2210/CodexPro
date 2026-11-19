# CodeX Architecture

**Status:** Distinguishes **Verified current** shape from **Proposed** targets.

## 1. Product architecture

CodeX combines Academy/DSA practice, collaborative IDE projects, contests, AI assistance, discussions, WebRTC, dashboards, and premium/payment UI.

Target student workflow (Proposed):
**Learn → Try → Practice → Guidance → Collaborate → Submit/compete → Review → Next.**

## 2. Current technical shape (Verified)

### Frontend

- React 19 + Vite 6 under `Frontend/src`
- React Router lazy routes in `routes/Routes.jsx`
- Redux Toolkit (`store/slices/*`) + Context (`context/*`)
- Canonical HTTP: `api/config.jsx` (axios). `utils/axiosClient.js` re-exports the same instance. SSE uses `apiFetch` / `getAuthToken` from the same module.
- Socket.IO client via `utils/socket.js` + middleware; WebRTC under `webrtc/`
- Shared UI: `components/ui/*` only

### Folder responsibilities (Frontend)

| Folder | Responsibility |
|--------|----------------|
| `views/` | Top-level pages (Landing, IDE Dashboard, Auth, Admin shell) |
| `components/<domain>/` | Feature UI (academy, contest, project, Ai, …) |
| `components/ui/` | Reusable primitives |
| `components/layout/` | Shell chrome |
| `api/` | Axios instance + shared fetch helpers |
| `utils/apis/` | Domain API helpers |
| `services/` | Thin service wrappers |
| `store/` | Redux |
| `context/` | Theme / contest / auth facade |
| `hooks/`, `lib/` | Shared hooks / notify-sounds |

### Backend

- `server.js`: HTTP server, Socket.IO, DB connect (`src/db/db.js`), Redis, cron
- `src/app.js`: Express middleware, CORS, route mounts, 404, errorHandler
- Layers: `routes/` → `controllers/` → `services/` / models; `middlewares/` for auth

### Dual auth boundaries (Verified)

| System | Pages | Mounts | Token | Frontend |
|--------|-------|--------|-------|----------|
| Team | `/login`, `/register` | `/api/auth`, projects, messages, webrtc, sockets | `codex_token` | `authSlice` |
| Academy | `/academy/login`, `/academy/register` | `/api/user` + academy APIs | `academy_token` | `AuthContext` + Google GIS |

**Decision:** Preserve both; separate pages; path-based tokens. See ADR-001, ADR-006, ADR-007.

### AI router ownership (Implemented)

| Routes | Owner file |
|--------|------------|
| `POST /api/ai/chat`, `POST /api/ai/assistant`, health/capabilities | `routes/AiChat.js` |
| Interview create/continue/end/session/feedback/resume/recording | `routes/aiInterview.js` |

### Dashboard split (Implemented)

| Route | Owner | Purpose |
|-------|-------|---------|
| `/dashboard` | `views/Dashboard.jsx` | IDE / projects / team |
| `/stats` | `dashboards/DashboardPage.jsx` | Problem analytics / heatmap / submissions |

## 3. Socket.IO / WebRTC (Verified intent; preserve contracts)

- Socket handshake expects team credentials today.
- Project rooms, chat, code sync, call signaling live in `server.js` + services.
- Do not redesign event names in casual fixes.

## 4. Proposed logical domain boundaries

Identity, Learning, Problems, Submissions/judge, Progress, Competition, Collaboration, Communication, AI mentor, Community, Billing, Platform infra — **logical**, not a mandate to microservice or rename folders.

## 5. Safe execution boundary (Proposed / security)

Do not execute hostile user code in the Express process. Prefer isolated judge workers/providers.
