# CodeX Project Memory

**Status:** Handoff after architecture stabilization (2026-11-20). Inspect source before relying on this.

## Product goal

Student-first platform: Learn → practice → AI guidance → collaborate → compete → review progress.

## What was Implemented this pass

- Import casing, Vite public assets, contest route order, AI route ownership.
- Canonical `api/config.jsx` helpers (`getApiBaseURL`, `getAuthToken`, `apiFetch`).
- AiAssistant POST + DoubtAi SSE auth fixes.
- AuthContext emailId + dual-identity-aware user selection (systems not merged).
- Routes: `/stats`, `/premium`, `/doubt-ai`; DashboardPage data repair; email verify popup for academy users.
- Express `errorHandler` mounted.
- CodeX_OS docs updated (CurrentState, Architecture, API, Decisions, KnownIssues, Tasks).

## Deferred (do not casually delete)

PremiumDashboard, `src/modules/**`, unifiedAuth, Redis rateLimiter, routes/user.js, SubmitCard, PlaylistCreate, Heatmap.jsx, og-image.

## Commands

```bash
cd Frontend && npm run lint && npm run build
cd Backend && npm run lint && node --check server.js && node --check src/app.js && npm test
```

## Verification evidence (2026-11-20)

- Frontend `npm run lint`: **0 errors**, 86 pre-existing warnings.
- Frontend `npm run build`: **passed** (~15.6s); `dist/logo.png` present (1,560,863 bytes).
- Backend `npm run lint`: **passed**.
- Backend `node --check` on server/app/contest/ai routes/controller: **passed**.
- Backend `npm test`: **passed** with no tests (`passWithNoTests`).
- No remaining `Context/ThemeContext` imports.

## Non-negotiables

- Preserve dual auth unless an ADR explicitly supersedes ADR-001.
- No payment controller/webhook changes without authorization.
- No paid AI calls during verification.
- Current folder structure is authoritative; fix references, don’t restore old paths.
- Read `CodeX_OS/` before application edits.
