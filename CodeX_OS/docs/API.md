# CodeX API Contracts

**Status:** Contract template and inventory starting point. Do not treat proposed routes as implemented. Audit existing routers/controllers before changing or adding endpoints.

## Existing route patterns observed in supplied files
- Auth router mounts under `/api/auth`.
- Project router mounts under `/api/projects`.
- Auth routes shown include register, login, verify, logout, team members/activity, and team messages.
- Project routes shown include create, list, fetch by ID, update, and AI review.
- API response formats are not fully consistent across all supplied controllers; standardize only with an explicit compatibility plan.

## Contract rules for new endpoints
For each endpoint document:
- Method/path and versioning policy.
- Purpose and authentication requirement.
- Resource ownership/role requirements.
- Request schema, validation, size limits.
- Success status and response schema.
- Error statuses and safe error format.
- Idempotency/retry semantics.
- Rate/cost limits.
- Audit/logging and privacy behavior.
- Tests including unauthorized and malformed requests.

## Proposed future API domains
- Problems and topics.
- Submissions and execution status.
- Learning progress and revision.
- Study rooms and membership.
- Contests, entries, results, and leaderboard.
- AI hints/reviews.
- System Design exercises and evaluations.

These are proposals, not existing endpoints. Prefer the established routing conventions until an audit supports a change.
## Current-repository reconciliation requirement
The frontend inventory reports API logic in `src/api/`, `src/services/`, `src/utils/apis/`, and standalone `src/utils/*api*` modules. Do not assume all are active or that reported endpoint alignment is still current.

Before changing an endpoint, trace:
1. Frontend call site and exact HTTP method/path/query/body/headers.
2. Axios base URL and interceptors.
3. Backend route mount prefix in `server.js`/`src/app.js`.
4. Route middleware and validation.
5. Controller/service behavior and model/provider effects.
6. Response and error shape consumed by the UI.
7. Auth/role/object-ownership checks and regression tests.

Maintain a route contract table with status **Verified**, **Reported**, or **Unknown**. Never “fix” a mismatch by changing only one side without checking all callers and backward compatibility.
