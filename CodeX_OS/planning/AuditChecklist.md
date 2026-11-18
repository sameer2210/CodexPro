# CodeX Read-Only Audit Checklist

Use this checklist before broad implementation. Do not mark a line complete without evidence from the current checkout.

## Repository baseline
- [ ] `git status` and branch captured; no user changes overwritten.
- [ ] Frontend/backend package manifests and lockfiles inspected.
- [ ] Node/package manager versions and actual scripts recorded.
- [ ] Frontend lint/build reproduced.
- [ ] Backend tests/lint/build/type-check commands run where available.
- [ ] Existing CI and deployment settings reviewed.

## End-to-end feature matrix
For each flow record: entry screen, client API/event, route/event registration, middleware, controller, service, model/provider, tests, result, evidence.
- [ ] Register/login/email verification/password reset
- [ ] Profile/settings/notifications
- [ ] DSA catalog/problem detail/playlist/editorial/video
- [ ] Problem editor/run/submit/history/progress
- [ ] AI assistant/doubt/interview/code review
- [ ] Project create/load/save/shared edit/chat
- [ ] Contest list/register/start/submit/leaderboard
- [ ] Discussion/create/comment/chat
- [ ] WebRTC join/call/leave/reconnect
- [ ] Admin/problem/video/user/contest management
- [ ] Payment/premium flows, if active

## Security
- [ ] Secrets rotated and Git history/deployment variables checked.
- [ ] Auth/session expiry and role enforcement tested.
- [ ] Cross-user and cross-resource authorization tests added.
- [ ] Socket handshake and every sensitive event checked.
- [ ] CORS, CSRF/token storage, request size and rate limits reviewed.
- [ ] Upload and AI input/output limits reviewed.
- [ ] Code execution isolation and resource limits proven.
- [ ] Payment webhook signatures/idempotency verified, if active.
- [ ] Logs redact tokens, secrets, personal data and submitted code as appropriate.

## Report format
For each finding: ID, severity, confidence label, evidence, reproduction, affected code, impact, recommended fix, test, owner, status. Separate confirmed defects from design recommendations.
