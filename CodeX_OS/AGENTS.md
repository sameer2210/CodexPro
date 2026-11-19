# CodeX — AI Engineering Operating System

## Mission
Evolve the existing CodeX product into a secure, reliable, student-first platform for DSA/System Design learning, collaborative coding, AI mentorship, and trustworthy competition. Improve learning outcomes and reliability rather than maximizing feature count.

## Required task startup
1. Inspect `git status`, current branch, uncommitted changes, and repository root. Preserve user work.
2. Read `CodeX_OS/README.md`, this file, and the relevant `docs/`, `planning/`, and `ai/` entries **before** editing application code.
3. Inspect actual files, manifests, lockfiles, imports, routes, middleware, controllers/services, models, socket events, tests, and scripts. Do not treat a tree/report as source-code verification.
4. Classify important findings as **Verified**, **Reported**, **Inferred**, **Proposed**, **Implemented**, **Deferred**, **Blocked**, or **Unknown**.
5. Write acceptance criteria and a proportionate plan before substantial changes.
6. Preserve dual auth (team `/api/auth` vs user `/api/user`) unless an ADR supersedes it. Prefer fixing imports/contracts over moving files. Reuse `components/ui/*` and the canonical axios instance in `api/config.jsx`.

## Source-of-truth hierarchy
- Explicit user-approved requirements and safety constraints.
- Actual code and tests for current behavior.
- `docs/PRD.md` for intended product behavior.
- `docs/CurrentState.md` for supplied inventory and confidence boundaries.
- `docs/Architecture.md` and `docs/TechStack.md` must distinguish current from target.
- `docs/Rules.md`, `docs/Security.md`, `docs/Testing.md`, and `docs/Design.md` define shared standards.
- `planning/Phases.md` and `planning/Tasks.md` define delivery order.
- `planning/Decisions.md` records consequential choices.
- `ai/Memory.md` is a concise handoff, never a substitute for inspection.

If sources conflict, state the conflict and gather evidence. Do not silently resolve consequential differences.

## Multi-agent coordination
- Assign one clear owner per task and define file ownership before parallel edits.
- Parallelize independent audits or bounded modules; avoid multiple agents editing the same file set.
- Integrate through small diffs. Inspect all agent changes and test the integrated result.
- Agents must not overwrite another agent's work or reset/clean the repository to make a task easier.
- Keep one canonical implementation for API clients, socket lifecycle, shared UI primitives, auth state, and domain logic. Do not create compatibility stubs or duplicate components without an approved migration plan.
- Each agent reports: files inspected/changed, evidence, tests run, risks, and open questions.

## Engineering workflow
For meaningful work:
1. Define user story and acceptance criteria.
2. Trace the end-to-end flow: UI → API/service → route → middleware → controller/service → model/provider; include socket events where relevant.
3. Identify authorization, validation, concurrency, failure, migration, and observability concerns.
4. Plan focused changes.
5. Implement small, reviewable changes.
6. Add/update regression tests.
7. Run relevant checks that exist in manifests/configuration.
8. Review the complete diff for bugs, secrets, unrelated changes, and API/data compatibility.
9. Update docs, task status, decisions, and memory as needed.
10. Report evidence and limitations accurately.

## Product and platform rules
- Guide learning through progressive hints; do not default to revealing complete solutions.
- Make presence, collaboration state, permissions, and reconnect behavior visible.
- Scores, verdicts, membership, roles, and progress must be derived or validated server-side.
- AI output is advisory, bounded, and never authoritative for judge verdicts or contest scores.
- Do not claim metrics, user counts, uptime, or capabilities without evidence.
- Keep DSA learning, practice, collaboration, and contests connected through shared problem/progress concepts.

## Security and reliability rules
- Never trust client-supplied identity, role, team membership, project ownership, contest score, accepted verdict, or target socket ID.
- Authorize every REST resource access and every sensitive Socket.IO event/room join.
- Never execute arbitrary user code in the Express process or an unrestricted host process. Use a properly isolated execution service/provider.
- Validate and bound inputs, payload sizes, execution time, output, AI context, uploads, and request rates.
- Keep secrets out of source, logs, docs, tests, commits, and responses. Production must fail fast on missing required secrets.
- Use explicit CORS allow-lists for production; do not combine wildcard origins with credentialed access.
- Treat schema/API changes as migrations; document rollback and compatibility.
- Do not commit, push, deploy, delete data, rotate production credentials, or change production configuration without suitable authorization.

## Verification labels
- **Verified:** reproduced by inspection/test/command in the current checkout.
- **Reported:** stated in supplied report but not reproduced in current checkout.
- **Inferred:** plausible from partial evidence; requires verification.
- **Proposed:** target behavior/architecture.
- **Unknown:** insufficient evidence.

Never claim tests, builds, audits, or deployments passed unless they were actually run and passed.

## Definition of done
Acceptance criteria met; relevant checks run or limitations documented; authorization and failure cases reviewed; user changes preserved; documentation updated; final report states exactly what changed, what was tested, and what remains unverified.
