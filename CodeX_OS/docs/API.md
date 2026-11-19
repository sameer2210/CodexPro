# CodeX API Contracts

**Status:** Verified mounts from `Backend/src/app.js` plus notes from the stabilization pass. Always re-check handlers before changing contracts.

## Canonical frontend client

- Base URL: `VITE_API_URL` or `${VITE_BACKEND_URL||http://localhost:8000}/api`
- Instance: `Frontend/src/api/config.jsx`
- Auth header: `Bearer` from `codex_token` || `token`
- SSE: `apiFetch(path, options)` — same base URL and token
- 401 (non-auth pages): clear storage → `/login`

## Mounted prefixes (Verified)

| Prefix | Router file | Auth family |
|--------|-------------|-------------|
| `GET /` | health in `app.js` | public |
| `/api/auth` | `auth.routes.js` | team JWT (`verifyToken`) |
| `/api/projects` | `project.routes.js` | team |
| `/api/messages` | `message.routes.js` | team |
| `/api/webrtc` | `webrtc.routes.js` | team (TURN) |
| `/api/user` | `userAuth.js` | user JWT (`userMiddleware` / admin) |
| `/api/problem` | `problemRoutes.js` | mixed |
| `/api/submission` | `submit.js` | user |
| `/api/ai` | `AiChat.js` **then** `aiInterview.js` | user |
| `/api/video` | `video.js` | admin |
| `/api/payments` | `payment.js` | user |
| `/api/contest` | `contestRoute.js` | mixed |
| `/api/playlists` | `playlistRoute.js` | user |
| `/api/discussions` | `discussionRoute.js` | user / optional |
| `/api/dsa` | `dsa.js` | user |

## AI contracts (Implemented)

| Method | Path | Owner | Notes |
|--------|------|-------|-------|
| POST | `/api/ai/chat` | AiChat | Body: messages + problem context; premium/tokens middleware; SSE |
| POST | `/api/ai/assistant` | AiChat | Body `{ query }` (also accepts query string); SSE |
| POST | `/api/ai/create-session` etc. | aiInterview | Interview only |

## Contest note (Implemented)

`GET /api/contest/user/history` is registered **before** `GET /api/contest/:id` so `user` is not captured as an id.

## User login contract (Verified)

`POST /api/user/login` expects `{ emailId, password }`. Response `{ user, token, message }` (no `success: true` required). Email is normalized to lowercase on login.

## Google Sign-In (Implemented)

`POST /api/user/googleLogin` body `{ credential }` (Google ID token from GIS).
Server verifies signature, audience (`GOOGLE_CLIENT_ID`), issuer, `sub`, email, `email_verified`.
Response `{ user, token, message }` (Academy JWT). Does not accept access tokens.

## Frontend token selection (Implemented)

| Paths | Token |
|-------|-------|
| `/auth`, `/projects`, `/messages`, `/webrtc` | `codex_token` |
| `/user`, `/problem`, `/submission`, `/contest`, `/playlists`, `/discussions`, `/ai`, `/payments`, `/dsa`, `/video` | `academy_token` |

## Unmounted (Deferred)

- `routes/user.js` (legacy Google surface)
