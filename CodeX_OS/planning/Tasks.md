# CodeX Task Backlog

**Status:** Candidate tasks; update after current-checkout audit. Mark completion only with evidence.

## P0 — Baseline and repository reconciliation
- [x] Record branch, `git status`, recent commits and worktree changes. (stabilization pass started from clean `main`)
- [x] Read frontend/backend manifests and lockfiles; list real scripts and versions.
- [x] Reproduce frontend lint/build after stabilization (lint 0 errors; build passed; logo in dist — see Memory).
- [x] Run backend lint / `node --check` / test after stabilization (all passed — see Memory).
- [x] Map Express route mounts; document dual auth + AI ownership (see `docs/API.md`, ADR-001/003).
- [x] Reconcile critical FE↔BE contracts for AI, contest history, user login emailId (Implemented).
- [ ] Full Socket.IO event matrix still open (preserve contracts; deeper audit deferred).
- [x] Module connectivity classification for dashboards/premium/doubt/orphans (see `docs/CurrentState.md`).
- [x] Baseline issues updated in `planning/KnownIssues.md`.

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
