# CodeX Current-State Inventory

**Status:** Updated after architecture stabilization pass (2026-11-20).
Labels: **Verified** (inspected/changed against current checkout) | **Implemented** (changed this pass) | **Deferred** | **Reported** (older claims).

## Confidence rule

Directory names show intended organization, not that every feature works. Prefer source and command evidence.

## Frontend (`Frontend/src/`) — Verified

| Area | Path | Status |
|------|------|--------|
| Entry | `main.jsx` → providers → `App.jsx` → `routes/Routes.jsx` | Verified |
| IDE dashboard | `views/Dashboard.jsx` → `/dashboard`, `/projects`, `/team`, `/activity` | Active |
| Analytics dashboard | `components/dashboards/DashboardPage.jsx` → `/stats` | **Implemented** (data mapping repaired) |
| Premium checkout UI | `components/common/Premium.jsx` → `/premium` | **Implemented** (route only; no payment logic change) |
| PremiumDashboard | `components/dashboards/PremiumDashboard.jsx` | **Deferred** (expects auth.profile fields absent from authSlice) |
| Doubt AI | `components/Ai/DoubtAi.jsx` → ProblemSolve + `/doubt-ai` | **Implemented** |
| AI Assistant | `components/Ai/AiAssistant.jsx` on Homepage | **Implemented** (POST `/ai/assistant` + shared token) |
| Context | `context/` (Auth, Contest, Theme) — lowercase | Verified; casing imports fixed |
| API client | `api/config.jsx` canonical; `utils/axiosClient.js` re-export; `apiFetch` for SSE | **Implemented** |
| UI primitives | `components/ui/*` | Reuse; do not add a second library |
| Orphans | SubmitCard stub, PlaylistCreate, Heatmap.jsx, AnimatedBackground, RecentSubmissions, StatsPieChart, Ai Mic/Resume helpers (partially reused) | **Deferred** |

### Frontend scripts (Verified)

- `dev`, `build`, `lint`, `preview`, `format`, `test` (vitest `--passWithNoTests`)
- No TypeScript / no path aliases
- `publicDir`: `Frontend/public` (serves `/logo.png`). `/og-image.png` still missing → Deferred

## Backend (`Backend/`) — Verified

| Area | Path | Status |
|------|------|--------|
| HTTP entry | `server.js` (listen + Socket.IO) | Verified |
| Express app | `src/app.js` (middleware + mounts) | Verified |
| Team auth | `/api/auth` → `auth.routes.js` + team JWT | Active — preserve |
| User auth | `/api/user` → `userAuth.js` + user JWT | Active — preserve |
| AI chat/assistant | `/api/ai` → `AiChat.js` only | **Implemented** ownership |
| AI interview | `/api/ai` → `aiInterview.js` (session/continue/feedback/resume) | Verified; duplicates removed |
| Contests | `contestRoute.js`; `/user/history` before `/:id` | **Implemented** |
| Error handler | `common/middleware/errorHandler.js` mounted | **Implemented** |
| `src/modules/**`, `unifiedAuth`, Redis `rateLimiter.js`, `routes/user.js`, `database/connection.js` | Unwired | **Deferred** |

## Dual identity (Verified — do not unify)

1. **Team/collab:** `/login`, `/register` → Redux `authSlice` → `codex_token` → `/api/auth`, projects, messages, webrtc, Socket.IO.
2. **User/academy:** `/academy/login`, `/academy/register` (+ Google) → `AuthContext` → `academy_token` → `/api/user` and academy APIs.

**Implemented (2026-11-20 auth pass):** Team `motion` crash fixed; Academy pages; GIS Google ID-token Sign-In; token isolation; no silent Google↔password email merge.

## Reconnected routes (Implemented)

| Path | Component |
|------|-----------|
| `/stats` | `DashboardPage` |
| `/premium` | `Premium` |
| `/doubt-ai` | `DoubtAi` |

## Not production-ready solely because builds pass

Socket auth is team-oriented; academy user JWT may not join project rooms. Payments require Razorpay env. AI needs backend Gemini keys. Judge isolation remains an open security decision.
