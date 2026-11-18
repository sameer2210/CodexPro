# CodeX Delivery Phases

**Status:** Proposed plan based on the latest reported repository inventory. Reorder only after the baseline audit and user approval.

## Phase 0 — Reconcile and verify current state
- Confirm branch/worktree, manifests, scripts, dependencies, deployment and actual routes.
- Reproduce reported frontend lint/build and run backend tests/build checks that exist.
- Create UI → API → route → handler → model/provider feature matrix.
- Audit security-sensitive REST and Socket.IO flows.
- Mark every feature as Working / Partial / Broken / Unknown with test evidence.
**Exit gate:** reproducible baseline, top risks ranked, MVP scope agreed.

## Phase 1 — Security and reliability foundation
- Rotate exposed credentials and inspect Git history/deployment secrets.
- Fix and test authentication, authorization, validation, CORS, socket event checks and resource ownership.
- Establish consistent errors/logging, environment validation, rate/resource limits and CI.
- Verify Redis, payments and external integrations or explicitly mark them inactive.
**Exit gate:** critical security defects fixed or documented as release blockers; core regression suite passes.

## Phase 2 — One complete DSA submission journey
- Validate problem schema and API contracts.
- Build/repair browse → solve → run sample → submit → verdict → history → progress.
- Implement/choose isolated code runner with limits and bounded queue.
- Add representative language, timeout, malformed input, output-limit and authorization tests.
**Exit gate:** verified deterministic results; arbitrary code is isolated from API server.

## Phase 3 — AI mentor integrated into learning
- Progressive hints and concept explanation.
- Context assembly from problem/code/attempt without unnecessary personal data.
- Structured output, provider timeout/quota handling, cost limits and safe fallbacks.
- Feedback quality evaluation with representative tasks.
**Exit gate:** AI is advisory, failures are recoverable, and full-solution reveal is deliberate.

## Phase 4 — Collaboration reliability
- Audit current project/team model and membership model.
- Secure room joins/events and unify client lifecycle.
- Test concurrent edits, presence, message persistence, disconnect/reconnect and unauthorized access.
- Stabilize call signaling and TURN/media permissions separately.
**Exit gate:** collaboration is reliable under tested concurrency and reconnect cases.

## Phase 5 — Progress and student motivation
- Derive solved counts and topic progress from verified submissions.
- Add revision/next-step recommendations.
- Add streaks/achievements only with clear definitions and abuse resistance.
**Exit gate:** dashboard metrics trace to source events and are testable.

## Phase 6 — Contest trustworthiness
- Validate contest lifecycle, time windows, registration and submission limits.
- Server-side scoring, deterministic tie-breaks, audit log and leaderboard consistency.
- Team contests only after team membership/identity is sound.
**Exit gate:** repeatable scoring tests and documented contest rules.

## Phase 7 — Interactive DSA Academy
- Improve existing visualizers with step controls, state explanations and learner prediction tasks.
- Connect lessons → practice problems → progress.
- Validate correctness and accessibility with students.
**Exit gate:** validated learning journeys, not just animated components.

## Phase 8 — System Design Studio
- Define learning path and target level.
- Add scenarios, diagrams, trade-off exercises, capacity reasoning and evaluation rubric.
- Consider collaborative whiteboard after core collaboration is stable.
**Exit gate:** reviewed content and scoring rubric.

## Phase 9 — Production readiness and scale
- Load/security testing, monitoring, backups and restore drills.
- Alerting, incident response, privacy/retention, deployment rollback and cost budgets.
- Scale sockets/queues/workers based on measured need.
**Exit gate:** agreed service, recovery, security and cost objectives measured.

## Release rule
Do not advance a phase because code compiles alone. Record acceptance evidence, unresolved risks, rollback needs and explicit risk acceptance.
