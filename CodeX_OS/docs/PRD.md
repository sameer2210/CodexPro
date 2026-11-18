# CodeX Product Requirements Document

**Status:** Product direction draft; feature inventory is reported, not a verified release checklist.

## 1. Vision
Build one student-first developer workspace where learners can learn DSA and System Design, practice problems, get progressive AI guidance, study with friends, collaborate on code, communicate, compete, and measure improvement.

**Core loop:** Learn → Try → Practice → Get guidance → Collaborate → Submit/compete → Reflect → Learn next.

## 2. Users
- Beginners who need examples, visualizations, and structured guidance.
- College students preparing for placements and coding interviews.
- Interview candidates who need consistent practice and feedback.
- Competitive programmers who want trustworthy contests and ratings.
- Study groups who want shared coding and accountability.

## 3. Product principles
1. Learning over answer copying.
2. Progressive hints before full solutions.
3. Individual progress remains attributable even during collaboration.
4. Contest scores and accepted verdicts are server-derived and reproducible.
5. AI is a mentor/advisor, not the judge or source of truth.
6. Accessibility, responsive design, privacy, and secure defaults.
7. Integrate features into one user journey rather than accumulating unrelated screens.

## 4. Current capability inventory (reported)
Existing source structure indicates UI/backend areas for:
- Accounts, verification, profiles, dashboards and admin.
- DSA problem browsing/solving, playlists, editorials/videos and visualizers.
- Project coding workspace, editor, output and AI review.
- AI assistant, doubt help, speech/audio helpers and interview flows.
- Contests, submissions, history and leaderboards.
- Discussion/comments, chat, notifications and active-member views.
- Socket.IO collaboration and WebRTC calling/signaling.
- Payment/premium-related components and backend configuration.

This inventory does not prove each feature is complete, secure, connected to the correct API, or ready for production. Phase 0 must validate end-to-end flows.

## 5. Product gap to solve
The challenge is not simply adding more screens. CodeX needs coherent identity, permissions, problem/submission contracts, reliable learning progress, safe execution, real-time room semantics, and measurable learning journeys. Validate these needs with target students before investing in advanced features.

## 6. Recommended delivery strategy
### Stage A — Stabilize existing product (first)
- Reproduce build/lint/tests and document baseline.
- Audit auth, role checks, REST resource ownership, Socket.IO rooms/events, code execution, secrets, uploads, payment hooks if active, and rate limits.
- Map every major frontend flow to the backend contract.
- Fix critical defects and add regression tests without broad rewrites.

### Stage B — DSA practice vertical slice
Deliver one complete journey: discover problem → read statement/examples/constraints → edit code → run safe sample tests → submit → receive verified result → inspect feedback → record progress.
Use existing components where sound; refactor only as required for correctness and maintainability.

### Stage C — AI learning mentor
Progressive hints, concept explanation, debugging, complexity feedback and solution review. Bound cost/context/timeouts; handle provider quota/failure; never let AI decide contest acceptance.

### Stage D — Reliable study collaboration
Room access control, shared editor, presence, chat, reconnect behavior and persisted state. Add audio/video only after signaling, permissions, TURN/media infrastructure and lifecycle tests are reliable.

### Stage E — Progress and motivation
Verified solved history, topic progress, revision recommendations, streaks/achievements only when metrics are meaningful and resistant to trivial manipulation.

### Stage F — Trustworthy contests
Lifecycle, registration, time windows, submission limits, deterministic scoring, tie-break rules, anti-abuse controls, individual/team ranking and audit history.

### Stage G — Learning expansion
Interactive DSA visualizations with learner predictions and exercises, followed by System Design lessons/scenarios/diagramming and explicit evaluation rubrics.

## 7. MVP success criteria
Finalize thresholds after baseline and student validation. Candidate measures:
- A new user can complete the core problem-solving flow without manual intervention.
- Submission verdicts are reproducible and derived from controlled tests.
- No cross-user/project/contest access is possible in tested authorization cases.
- Progress changes only after qualifying server-verified activity.
- Collaboration survives disconnect/reconnect without silent data loss.
- AI failures do not corrupt state or block core practice.
- Usability sessions show learners understand the next step and feedback.

Do not fabricate target values or present them as measured results.

## 8. Non-goals for the first stabilization cycle
- Rewriting the app into microservices.
- Replacing all existing UI/folders solely for aesthetic consistency.
- Adding every proposed feature simultaneously.
- Treating a successful production build as proof of security or user value.
- Launching public arbitrary-code execution without a dedicated isolation plan.

## 9. Decisions still needed
- Which feature flows are currently used by real users and must not regress?
- What is the first public-ready vertical slice?
- Which execution provider/isolation approach fits language support and budget?
- What AI usage/cost limits are acceptable?
- What is the intended team/invitation and account identity model?
- Are payments/premium in scope now?
- What contest scoring and rating model is desired?
