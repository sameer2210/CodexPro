# CodeX Testing Strategy

## Layers
- Unit: business rules, validation, scoring, complexity metadata; Frontend Vitest + React Testing Library (auth pages, token isolation).
- Integration: Backend Jest + Supertest against a **dedicated test database** (MongoMemoryServer for auth suites). Never production credentials or production user data.
- Real-time: room authorization, event validation, reconnect, ordering/versioning, simultaneous edits.
- E2E: Playwright (Frontend) — Team/Academy Login/Register, mocked Google Sign-In, logout, protected routes.
- Security: cross-team access, invalid/expired Google credentials, wrong audience, email collisions, duplicate Google identities, unauthorized access, scoped 401 / token isolation.
- Performance: concurrent editors, execution queue pressure, contest spikes, AI quota exhaustion.
- Accessibility: keyboard navigation, focus, labels, contrast, reduced motion.

## Authentication test map

| Layer | Tool | Location | Notes |
| --- | --- | --- | --- |
| FE unit | Vitest + RTL | `Frontend/src/**/*.test.{js,jsx}` | Pages + `authTokens` isolation |
| BE unit (mocked Google) | Jest | `Backend/src/__tests__/googleLogin*.test.js` | Mocked `verifyIdToken` only |
| BE integration | Jest + Supertest | `Backend/src/__tests__/auth.integration.test.js` | In-memory Mongo `codex-auth-test` |
| E2E (mocked GIS) | Playwright | `Frontend/e2e/auth.spec.js` | Intercepts API; stubs GIS |
| E2E (live Google) | Playwright | `Frontend/e2e/google.live.spec.js` | **Skipped** unless `RUN_LIVE_GOOGLE_E2E=1` + real Google test account |

### Google Sign-In distinction
- **Mocked verification** (Jest + Playwright GIS stub): proves server/client handling of credentials, audience errors, collisions — does **not** prove live Google login.
- **Live Google browser integration**: only when a real Google test account is used (`RUN_LIVE_GOOGLE_E2E=1`). Do not claim live Google login is verified without that.

## Commands
```bash
# Frontend unit
cd Frontend && npm run test:run

# Backend auth (unit + integration)
cd Backend && npm test

# Playwright E2E (starts Vite; mocked Google only by default)
cd Frontend && npm run test:e2e
```

## CI
`.github/workflows/auth-ci.yml` runs Frontend Vitest + build, Backend Jest auth suite, and Playwright Chromium E2E on pull requests.

## Regression scenarios
- Users cannot read/write another team's private resources.
- Socket cannot join a room without authorization.
- Reconnect does not silently lose accepted edits.
- Duplicate submissions do not double-count score.
- Client cannot forge accepted status or leaderboard points.
- Execution timeout/output limits are enforced.
- AI provider failures return safe, understandable errors.
- Malformed input and empty states do not crash the app.
- Failed provider/database operations are not reported as success.
- Team JWT does not unlock Academy routes; Academy JWT does not unlock Team verify.
- Scoped 401 clears only the matching session keys (`codex_*` vs `academy_*`).

## Test discipline
Inspect current scripts/frameworks first. Use deterministic fixtures and isolate external services where appropriate. Keep hidden tests server-side. Run focused tests during development and relevant broader checks before completion. State which checks were not run and why. Preserve existing Vitest/Jest tests when extending coverage.
