# CodeX Architecture

**Status:** Current inventory reconciled from supplied structures; runtime and implementation details still require source-level verification.

## 1. Product architecture
CodeX is an existing full-stack application that combines:
1. Academy and DSA practice.
2. Project-based collaborative coding.
3. Contest/arena and submissions.
4. AI assistance and interview preparation.
5. Community discussion and messaging.
6. Audio/video calling and WebRTC signaling.
7. User dashboards, profiles, administration, and reported payment/premium features.

The target is one coherent student workflow, not a collection of disconnected screens:
**Learn → Try → Practice → Ask for guidance → Collaborate → Submit/compete → Review progress → Learn next.**

## 2. Current technical shape (Reported)
### Frontend
React/Vite application under `Frontend/src`, with React Router routes, Redux Toolkit store/slices, React Context providers, Axios clients, Socket.IO middleware, Monaco editor components, WebRTC helpers, DSA visualizers, and feature UI components. The supplied frontend audit reports successful build/lint after path/import/API cleanup; reproduce before relying on it.

### Backend
Node/Express application with bootstrap files `server.js` and `src/app.js`, configuration modules for DB/Redis/payment/socket, route/controller/middleware/service/model layers, Mongoose models, Socket.IO, AI integrations, and WebRTC routes. Exact mount prefixes and overlapping route ownership must be read from source.

### Data
MongoDB/Mongoose appears to be the main persistence layer. Models include users, teams, projects, messages, problems, submissions, contests/participations/leaderboards, discussions/comments, playlists, and solution videos. Verify schemas, indexes, constraints, ownership relationships, and actual production database before migrations.

## 3. Architecture risks to resolve before adding features
- Identify the one backend entry point and the exact middleware/route registration sequence.
- Build a route contract map from mounted routes, not README guesses.
- Establish canonical frontend API client ownership and eliminate accidental duplicated base URLs.
- Establish a single Socket.IO client lifecycle and per-event server authorization.
- Verify whether project/team identity is truly user-centric and how membership/invitations are enforced.
- Audit contest submission correctness and determine how code is compiled/executed.
- Confirm payment provider, webhook handling, idempotency, and entitlement state if payment is active.
- Confirm Redis purpose and behavior when unavailable.
- Separate AI advisory feedback from deterministic judge verdicts and ranking.

## 4. Proposed logical boundaries
Keep the existing deployment shape unless evidence requires a split. Organize responsibilities logically:
- Identity: users, auth, profile, verification, roles.
- Learning: topics, roadmap, lessons, visualizations, playlists, revision.
- Problems: catalog, examples, hints, editor configuration.
- Submissions/judge: submission lifecycle, isolated execution, verdicts, test results.
- Progress: solved history, topic mastery, streaks, recommendations.
- Competition: contest lifecycle, participation, scoring, rankings.
- Collaboration: project/study room, shared document, presence, chat.
- Communication: call signaling, media configuration, notifications.
- AI mentor: context assembly, provider adapter, budgets, structured feedback.
- Community: discussion, comments, moderation.
- Billing (if retained): plans, provider webhooks, entitlements.
- Platform infrastructure: configuration, logs, metrics, rate limits, queues, storage.

These are domain boundaries, not a mandate to create microservices or rename every folder.

## 5. Target system view
```text
React/Vite client
  ├─ Academy / Problems / Visualizers
  ├─ Editor / Collaboration / Calls
  ├─ Contests / Submissions / Leaderboards
  ├─ AI Mentor / Discussions / Profile
  └─ Canonical API + Socket clients
             │
Express API + authenticated Socket.IO
  ├─ Auth / authorization / validation
  ├─ Domain routes → controllers → services
  ├─ MongoDB/Mongoose persistence
  ├─ AI provider adapter
  ├─ payment provider (if active)
  └─ queue/adapter → isolated judge worker/provider
WebRTC media: browser peers + configured STUN/TURN or managed provider
Operations: logs, metrics, backups, alerts, deployment and rollback
```

## 6. Safe execution boundary
Do not expose arbitrary code execution through the main Express process. A production judge needs an isolated worker/provider with explicit CPU, memory, wall-time, process, filesystem, network, and output constraints; bounded queueing; cancellation; and auditable results. `node:vm` alone is not a security boundary for hostile code.

## 7. Collaboration model
- Authenticate socket connections.
- Derive user identity from verified server-side credentials.
- Authorize every room join and event against the referenced project/session and membership.
- Validate payload size/schema and rate-limit high-frequency events.
- Define persistence, ordering, reconnection, and conflict semantics.
- Do not let client-provided socket IDs or room names bypass membership checks.
- Decide whether the existing synchronization is sufficient before adopting CRDT/OT.

## 8. Scaling strategy
Begin with a modular monolith. Add Redis adapters, queues, worker services, or separate deployments only when required by measured scale, isolation, or reliability. Document the operational cost and failure mode of each new dependency.
