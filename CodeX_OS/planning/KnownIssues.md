# CodeX Known Issues and Risks

Reproduce before treating as active defects. Items marked **Addressed** were fixed in the 2026-11-20 stabilization pass.

## Addressed this pass (Implemented)

- Case-sensitive `Context/ThemeContext` imports → `context/` (Sidebar, ActiveMember, ActiveMemberPage).
- Vite `publicDir` → `Frontend/public` with `logo.png`.
- Stale Vitest `setupFiles` removed (no tests required setup).
- Contest `GET /user/history` ordered before `/:id`.
- Duplicate `/api/ai` `/chat` and `/assistant` on interview router removed.
- AiAssistant / DoubtAi token + base URL aligned with canonical client; assistant POST body.
- AuthContext user login uses `emailId`; academy vs team identity selection without unification.
- Analytics dashboard data mapping + `/stats` route.
- `/premium` and `/doubt-ai` routes reconnected.
- EmailVerificationPopup for academy users with `emailVerified === false`.
- Central `errorHandler` mounted on Express app.

## Google Console (Blocked until configured)

- Set `GOOGLE_CLIENT_ID` (Backend) and `VITE_GOOGLE_CLIENT_ID` (Frontend) to the same OAuth 2.0 Web client ID.
- Authorized JavaScript origins: local Vite origin (e.g. `http://localhost:5173`) and production frontend origin.
- Do not place Google client secrets in `VITE_*` variables.

## Deferred

- Explicit authenticated Google↔password account linking UI (currently 409 on email collision).
- `PremiumDashboard` — needs profile/entitlement fields not on authSlice.
- `src/modules/**`, `unifiedAuth`, Redis `rateLimiter.js`, `routes/user.js`, `database/connection.js`.
- SubmitCard stub, PlaylistCreate, Heatmap.jsx duplicate, AnimatedBackground, unused zustand.
- `/og-image.png` missing from public.
- Interview still uses inline SpeechRecognition (shared STT util optional).
- Dual identity: academy JWT still cannot drive team Socket.IO rooms.
- Payment checkout needs `VITE_RAZORPAY_KEY` / backend Razorpay config (UI only reconnected).
- No automated test suite body despite Jest/Vitest scripts.
- `node:vm` / in-process execution risk for judge paths — security follow-up.
- Credential rotation if secrets were ever committed — security follow-up (do not paste secrets into docs).

## Architecture risks still open

- Overlapping FE API modules (`api/`, `services/`, `utils/apis/`) — canonical instance exists; helpers remain distributed by domain (acceptable).
- Contest scoring, hidden tests, and isolated execution need product decisions before claiming contest trustworthiness.
