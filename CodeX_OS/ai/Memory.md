# CodeX Project Memory

**Status:** Handoff after auth repair + Google Sign-In (2026-11-20).

## Auth map (do not unify)

| Domain | Pages | State | Token | API |
|--------|-------|-------|-------|-----|
| Team | `/login`, `/register` | Redux authSlice | `codex_token` | `/api/auth` |
| Academy | `/academy/login`, `/academy/register` | AuthContext | `academy_token` | `/api/user` |

Google Sign-In: Academy only. GIS → `POST /user/googleLogin` with `{ credential }` ID token.

## Root cause fixed

Team Login/Register crashed: `motion` used without import from `framer-motion`.

## Env you must set for Google

```
# Backend
GOOGLE_CLIENT_ID=...apps.googleusercontent.com

# Frontend
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

## Commands

```bash
cd Frontend && npm run lint && npm run build && npx vitest run src/api/authTokens.test.js
cd Backend && npm run lint && node --check src/controllers/userAuthenticate.js && npm test
```

## Non-negotiables

- Preserve dual auth (ADR-001, ADR-006, ADR-007).
- Never overwrite `codex_token` with Academy JWT.
- Never trust Google email without ID-token verification.
- No silent account merge by email.
