# CodeX Known Issues and Risks

This register combines reported findings and audit targets. It is not a list of confirmed defects. Reproduce each item against the current checkout before changing code.

## Previously reported frontend reconciliation (not yet reproduced)
- Directory casing `Context` → `context` normalized.
- Duplicate component copies and common re-export stubs removed.
- Broken imports/assets and UI dependency imports corrected.
- Notification suppression changed to per-message deduplication.
- Socket.IO client lifecycle consolidated through middleware/helper.
- Frontend endpoint paths aligned to backend routes.
- React Router inventory completed and routes lazy-loaded.
- ESLint and Vite production build reportedly passed.
**Required follow-up:** rerun checks, inspect git diff/history, compare exact frontend requests with Express route mounts and response contracts, and test the main user journeys.

## Security risks previously inferred from partial supplied code
- **Credential exposure:** supplied `.env` was reported to contain a Google API key and weak JWT secret. Treat as exposed, rotate, inspect Git history and deployment secrets. Do not repeat values in documentation.
- **JWT/env fallbacks:** verify production fails fast for missing or weak secrets.
- **MongoDB configuration:** verify required URI validation and no unsafe fallback.
- **CORS:** earlier partial source indicated wildcard Socket.IO origin with credentials; confirm current config and restrict production origins.
- **Socket authentication:** verify unauthenticated clients cannot connect to protected events.
- **Resource authorization:** verify project/team/contest/discussion ownership and membership on every REST and socket action.
- **Call signaling:** validate participant membership and avoid trusting arbitrary client-provided socket IDs.
- **Code execution:** `node:vm` was referenced in project material. It is not sufficient as a security boundary for hostile code; use an isolated runner/provider.
- **Rate limiting:** inspect custom in-memory limiter behavior, multi-instance consistency, proxy trust and resource bounds.
- **Identity/team model:** verify unique individual accounts, invitation flow, role changes, membership removal and account ownership.
- **AI provider:** verify SDK/API compatibility, response parsing, quota/timeout handling and user-visible failure states.
- **Frontend token handling:** inspect storage and 401 behavior; avoid clearing unrelated local storage and assess XSS/token exposure.
- **Payment configuration:** provider config exists in the tree; confirm whether payments are active and audit signature validation, idempotency and entitlements if so.
- **Tests:** do not infer actual coverage from filenames/configs; inspect package scripts and run tests.

## Architecture and product risks
- Two potential bootstrap layers (`server.js`, `src/app.js`) need clearly defined responsibility.
- Multiple frontend API folders (`api/`, `services/`, `utils/apis/`, standalone `utils/*api*`) need canonical ownership and endpoint contracts.
- Frontend has both Academy/contest/connections/discuss domains and top-level views; ensure this remains navigable without broad rewrite.
- Existing feature filenames do not prove complete end-to-end behavior.
- Current problem execution/judge semantics, contest scoring, progress provenance and hidden test protection need verification.
- Redis, payment/premium, and TURN infrastructure may be configured but unused or incomplete.

For every confirmed issue, record: severity, evidence/reproduction, affected version/files, impact, fix, regression test, owner, and verification result.
