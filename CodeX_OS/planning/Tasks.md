# CodeX Task Backlog

**Status:** Candidate tasks; update after current-checkout audit. Mark completion only with evidence.

## P0 — Baseline and repository reconciliation
- [ ] Record branch, `git status`, recent commits and worktree changes.
- [ ] Read frontend/backend manifests and lockfiles; list real scripts and versions.
- [ ] Reproduce frontend lint/build claims from the supplied audit report.
- [ ] Run backend tests/build/lint commands that actually exist; record absent scripts separately.
- [ ] Map all Express route mounts and identify overlap between `server.js`, `src/app.js`, auth/user routes and controllers.
- [ ] Build endpoint matrix: frontend client → method/path/body → backend mount/route → middleware → handler → response.
- [ ] Build Socket.IO event matrix: auth, payload, room, authorization, persistence, rate limit and failure behavior.
- [ ] Build feature matrix for Academy, editor, AI, contests, discussion, calls, dashboards, admin and payments.
- [ ] Classify each flow Working / Partial / Broken / Unknown with evidence.
- [ ] Create baseline issue list without changing code.

## P0 — Security blockers
- [ ] Rotate exposed Google AI credentials and replace weak JWT secret; inspect Git history and deployment variables.
- [ ] Verify production env validation and remove insecure fallbacks.
- [ ] Test REST authentication and object-level authorization for projects, teams, submissions, discussions, contests and admin APIs.
- [ ] Test socket authentication, room membership, event authorization and target recipient validation.
- [ ] Audit CORS, CSRF/token storage trade-offs, rate limiting, payload size and proxy trust.
- [ ] Confirm code execution is not running hostile submissions in the API process.
- [ ] If payments are active, verify signed webhooks, idempotency, entitlement checks and replay handling.
- [ ] Review uploads, AI endpoints, privacy/log redaction and account enumeration.

## P1 — DSA end-to-end vertical slice
- [ ] Trace current problem catalog and solver screens to actual APIs.
- [ ] Verify examples, constraints, language support and validation contracts.
- [ ] Define submission lifecycle and authoritative verdict schema.
- [ ] Choose isolated execution provider/worker; define resource and network limits.
- [ ] Test accepted, wrong answer, compile/runtime error, timeout, output limit and duplicate submission.
- [ ] Verify submission history and progress update from server-verified outcomes.

## P2 — AI mentor
- [ ] Reconcile AI SDK usage, models, response parsing and error handling.
- [ ] Define progressive hint levels and explicit full-solution reveal.
- [ ] Bound context length, timeouts, retries, rate/cost quotas and logs.
- [ ] Evaluate feedback on representative DSA/code cases.

## P3 — Realtime collaboration and calls
- [ ] Locate all `io()`/socket client creation and prove one lifecycle per intended app/session.
- [ ] Define canonical socket event contracts and authorization.
- [ ] Test multi-client edit ordering, persistence, reconnect, duplicate delivery and stale state.
- [ ] Test WebRTC permission denial, ICE failure, TURN use, participant removal and cleanup.
- [ ] Decide whether existing team/project model supports study rooms or requires a safe incremental domain model.

## P4 — Progress, contests, and learning
- [ ] Define verified progress metrics and data provenance.
- [ ] Document contest rules, time source, scoring and tie-breaks.
- [ ] Test contest registration, boundary times, unauthorized submissions and leaderboard recomputation.
- [ ] Connect visualizers/lessons to practice and learner progress.
- [ ] Gather student usability feedback before expanding gamification.

## P5 — Operations and future capability
- [ ] Verify Redis purpose and behavior during outages.
- [ ] Verify payment/premium scope and production status.
- [ ] Add health/readiness checks, structured logs, metrics and alerts where missing.
- [ ] Add backup/restore and deployment rollback documentation.
- [ ] Define System Design Studio MVP only after the DSA core journey is reliable.
