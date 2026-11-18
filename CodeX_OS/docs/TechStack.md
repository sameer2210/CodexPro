# CodeX Technology Stack

**Rule:** distinguish user-reported inventory from verified package/runtime facts. Read the current manifests and lockfiles before upgrading or installing dependencies.

## Reported frontend technologies
| Area | Reported technology | Audit action |
|---|---|---|
| UI | React + Vite | Verify versions and scripts from `Frontend/package.json` and lockfile |
| Routing | React Router | Check route tree, guards, not-found handling and lazy boundaries |
| State | Redux Toolkit slices for auth, call, problem, project, socket; Context for auth/contest/theme | Define canonical ownership; avoid duplicated sources of truth |
| Editor | Monaco-based project/problem editor components | Check editor versions, model lifecycle and collaboration synchronization |
| HTTP | Axios clients/config and domain API modules | Map base URLs, auth behavior, payloads and error handling |
| Realtime | Socket.IO client and middleware | Verify single connection, auth, reconnect and cleanup |
| Media | WebRTC helpers (`callManager`, `media`, `peer`) | Test permission failures, TURN, disconnects and cleanup |
| UI | Framer Motion, Sonner-style notifications reported in audit, shared UI components | Verify dependency and avoid mixed notification systems |
| Learning | DSA visualizers, Academy and contest views | Check accessibility, correctness and tests |

## Reported backend technologies
| Area | Reported technology | Audit action |
|---|---|---|
| Runtime/API | Node.js + Express | Verify Node engine, version and bootstrap |
| Persistence | MongoDB + Mongoose | Inspect schemas, indexes, migrations/data backfills |
| Realtime | Socket.IO | Audit event contracts and resource-level authorization |
| Identity | JWT and auth/admin/user middleware | Verify expiry, rotation, revocation strategy and role enforcement |
| AI | Gemini/Google GenAI-related controllers/services | Reconcile SDK package/model names and parse errors safely |
| Infrastructure | Redis config, payment gateway config, rate limiter | Verify active usage, failover, secrets, webhooks and limits |
| Code execution | Project material mentions `node:vm` | Do not treat as safe hostile-code sandbox; select isolated runner/provider |

## Repository facts to verify
- Frontend manifest and lockfile versions; supplied directory tree does not include them.
- Backend `package.json`, lockfile, Node engine, scripts, and package versions.
- Whether both `server.js` and `src/app.js` are intentional bootstrap/config separation.
- Whether Redis is active or unused.
- Whether payment/premium is production functionality or incomplete scaffolding.
- Actual test frameworks and executable scripts. Do not infer coverage from config-file presence.
- Hosting, deployment variables, domain, and production service configuration.

## Dependency policy
Do not upgrade merely to modernize. Check compatibility, security support, official changelogs, hosting constraints, migration cost, and rollback strategy. Add dependencies only for a concrete requirement and document why existing tools are insufficient.
