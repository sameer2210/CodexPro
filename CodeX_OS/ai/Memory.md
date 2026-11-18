# CodeX Project Memory

**Status:** Updated from latest user-provided structure and reports; current checkout audit remains pending.

## Product goal
A unified, student-first developer platform:
Learn DSA/System Design → practice → ask AI for progressive guidance → collaborate with friends → submit/compete → analyze progress → improve.

## Reported current repository
### Frontend
React/Vite structure includes Academy and DSA visualizers, problem solving, admin, AI assistant/doubt/interview, auth, dashboards, project editor/output/review, contests/submissions/leaderboards, discussions, calls/Meetings, profiles, notifications/settings, Redux slices, Context providers, Axios API helpers, Socket.IO middleware and WebRTC helpers.

### Backend
Node/Express structure includes configuration for DB/Redis/payment/socket; controllers/routes/middleware/services/models for auth/users, projects/messages, problems/submissions, contests/leaderboards, discussions, AI/interviews, videos/playlists, payments and WebRTC.

### Reported frontend cleanup
A supplied audit report says import/path casing, duplicate/stub components, route/API mismatches, notification behavior and socket lifecycle were reconciled; lint and production build reportedly passed. Reproduce on current branch before calling this verified.

## Confidence rules
- Directory names show intended organization, not that features work.
- Label findings Verified, Reported, Inferred, Proposed, or Unknown.
- Check actual manifests/lockfiles/scripts and current code.
- Never state the full repository was audited until the audit has been performed.

## Immediate priorities
1. Run a read-only baseline audit and map UI → API → backend route → handler → model/provider.
2. Rotate exposed credentials and inspect Git history/deployment variables.
3. Verify REST and Socket.IO authorization, CORS, identity/team membership and code execution isolation.
4. Reproduce lint/build/tests and document current failures.
5. Fix the highest-risk gaps, then ship one complete DSA problem/submission/progress vertical slice.
6. Stabilize collaboration; add advanced contests, gamification and System Design after core journeys are reliable.

## Non-negotiable safety
Do not run hostile code in the API process; `node:vm` alone is not a secure sandbox. AI must not decide accepted verdicts or contest scores. Never expose secrets or change production data without authorization.

## Open decisions
- Code runner/provider and supported languages.
- Canonical API and socket ownership.
- Individual account/team/invitation model.
- AI provider, budgets and rate limits.
- Contest scoring/rating model.
- Whether payments/premium are in active scope.
- MVP acceptance thresholds and student validation.
