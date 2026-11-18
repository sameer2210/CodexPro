# CodeX Current-State Inventory and Audit Boundaries

**Status:** Reconciled from the latest user-provided frontend/backend trees, product vision, and supplied frontend audit report. This is not a fresh checkout audit.

## Confidence labels
- **Reported:** present in the user-supplied audit/report or directory listing.
- **Inferred:** likely responsibility inferred from filenames; implementation is not confirmed.
- **Verified:** only use after opening current source or running a relevant check.
- **Proposed:** future design decision, not an existing capability.

The supplied frontend report claims 128 source modules were audited, no broken imports/stubs remained, ESLint passed, and Vite build passed. Treat those results as **Reported** until reproduced on the current branch. Its route/API descriptions may have drifted and must be compared to current source.

## Frontend inventory (reported)
Root: `Frontend/src/`
- `api/`: `config.jsx`
- `components/academy/`: DSAVisualizer, Editorial, Explore, Interview, PlaylistCreate, PlaylistDetail, Problem, ProblemSolve
- `components/admin/`: problem CRUD, video management, platform/user analytics, user management, contest admin/create/detail
- `components/Ai/`: AiAssistant, DoubtAi, AudioPlayer, MicInput, ResumeUpload and stylesheet
- `components/auth/`: email verification, forgot/reset password
- `components/background/`: AnimatedBackground, HUD
- `components/common/`: Heatmap, HeatmapCalendar, PaymentHistory, Premium, SidebarProfileCard
- `components/connections/`: CallingPage, ChatSection, DiscussionDetail, DiscussPage, Meeting
- `components/contest/`: contest details/leaderboard/problem solving/submission UI
- `components/dashboards/`: DashboardPage, PremiumDashboard
- `components/discuss/`: chat/comments/discussion components
- `components/layout/`: Layout, Navbar, Navigation, Sidebar
- `components/page/`: Help, Notification, Settings
- `components/project/`: CodeEditor, CreateProject, OutputPanel, Project, RecentSubmissions, ReviewPanel, StatsOverview, StatsPieChart, SubmissionsTabs
- `components/ui/`: Button, ErrorBoundary, input, Loader, LoadingSpinner, NotFound, ResizableContainer, select
- `components/user/`: ActiveMember, ActiveMemberPage, ProfileCard, UserProfile
- `components/visualizers/`: Array, Graph, LinkedList, Queue, Stack, Tree visualizers
- `context/`: AuthContext, ContestContext, ThemeContext
- `hooks/`: useToast
- `lib/`: notify, sounds
- `routes/`: Routes.jsx
- `services/`: dashboardService.js
- `store/`: auth, call, problem, project, socket slices; store and hooks
- `utils/`: AI speech helpers, contest/admin/dashboard/user API modules, axios client, interview/project APIs, socket and socket middleware
- `views/`: admin, arena, auth, Dashboard, Homepage, Landing
- `webrtc/`: callManager, media, peer
- Root app files: App.jsx, index.css, main.jsx

### Frontend report claims requiring reproduction
- Case-sensitive `Context` → `context` imports were normalized.
- Duplicate components and re-export stubs were removed.
- Routes, API endpoints, notification behavior, and Socket.IO lifecycle were reconciled.
- Missing imports/styles were fixed.
- ESLint and Vite production build passed.
- Reported route list and API mappings should be checked against current `Routes.jsx`, backend route registration, and actual request payloads.
- A single socket lifecycle is claimed; verify `io()` usage globally and inspect cleanup/reconnect behavior.

## Backend inventory (reported)
Root entries: `.env`, `.gitignore`, `package.json`, `package-lock.json`, `server.js`; application code under `src/`.
- `src/app.js`; config: `config.js`, `payGateway.js`, `redis.js`, `socket.js`
- Controllers: admin/auth, AI assistant, contests/submissions, dashboard, discussion/socket discussion, doubt AI, Gemini, interview, leaderboard, messages, payments, projects, user auth, problems/submissions, verification, videos
- Database: `src/db/db.js`
- Middleware: admin, auth, rate limiter, user
- Models: comment, contest, contest submission, discussion, leaderboard, message, participation, playlist, problem, project, solution video, submission, team, user
- Routes: AI chat/interview, auth, contests, discussions, DSA, messages, payments, playlists, problems, projects, submissions, users, user auth, videos, WebRTC
- Services: AI, auth, call, Gemini manager, message, problem utility, profile image generator, project, validator

## Reported feature areas (not proof of end-to-end readiness)
- Identity/auth and profile management
- DSA problem catalog, solving, editorial/video, playlists, visualizers
- Admin problem/video/user/contest management
- Contests, submissions, history, leaderboards
- AI chat, doubt support, interviews, code review, audio/speech helpers
- Project editor, project/chat persistence, Socket.IO collaboration
- WebRTC calling/signaling and TURN configuration
- Discussions, notifications, dashboards, payments/premium
- User activity, heatmaps and stats

## Initial architecture observations
- Frontend has overlapping organizational categories: `components/academy`, `components/contest`, `components/connections`, `components/discuss`, and `views/Arena`; shared API logic appears in `api/`, `services/`, and `utils/apis/`. This is not automatically wrong, but each domain needs a canonical owner and clear imports.
- Backend route/controller/service/model separation exists by filename, but route overlap (`auth.routes.js` vs `userAuth.js`, for example) and controller overlap must be mapped from `app.js` and `server.js`.
- `server.js` and `src/app.js` both exist; establish whether one is the bootstrap and one configures Express, and avoid duplicate middleware/server setup.
- `config/redis.js` exists; actual Redis usage, requiredness, and deployment role need verification.
- Payment gateway code exists; provider, webhook validation, idempotency, and entitlement rules need verification before monetization is treated as production-ready.
- `node:vm` is mentioned in supplied project material for JavaScript execution. It must not be assumed to safely isolate hostile code.

## First audit deliverables
1. Actual route map: HTTP method, mounted prefix, handler, auth middleware, role, validation, rate limits.
2. Socket event map: event name, authenticated identity, room/resource authorization, payload schema, persistence, failure handling.
3. Feature matrix: UI entry point → API/event → backend handler → model/provider → tests → status.
4. Reproducible quality baseline: install state, scripts, lint, tests, build, E2E, and known failures.
5. Security risk register with evidence, severity, reproduction, owner, regression test.
6. Architecture decisions and MVP scope approved before large refactors.
