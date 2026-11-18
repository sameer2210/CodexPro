# CodeX — AI Developer Operating System

This repository of operating documents guides multi-agent development of the existing CodeX codebase into a reliable, student-first learning and collaboration platform.

## Current baseline
The latest user-provided inventory describes an established React frontend and Express backend with DSA Academy, problem solving, contests, admin tools, AI assistance, discussions, dashboards, project collaboration, Socket.IO, WebRTC, and user/profile features. A supplied frontend reconciliation report additionally *reports* that import/path cleanup, endpoint alignment, routing work, lint, and production build were completed.

These are **reported or inferred capabilities, not a fresh repository verification**. The source tree is a map, not proof that every feature works end-to-end. See `docs/CurrentState.md`.

## Operating files
- `AGENTS.md`: rules for coding agents and parallel work
- `docs/PRD.md`: product outcomes, user journeys, MVP and non-goals
- `docs/CurrentState.md`: supplied baseline, confidence labels, inventory and audit boundaries
- `docs/Architecture.md`, `docs/TechStack.md`: observed versus target architecture
- `docs/Security.md`, `docs/Testing.md`, `docs/CodeReview.md`: cross-cutting quality gates
- `docs/API.md`, `docs/Database.md`: contract and data-model guidance
- `planning/Phases.md`, `planning/Tasks.md`: sequencing and backlog
- `planning/KnownIssues.md`: risk register; validate before treating items as confirmed
- `planning/Decisions.md`: record architectural decisions
- `ai/Memory.md`: concise handoff for agents

## Mandatory workflow
1. Preserve user changes and inspect the actual repo, manifests, lockfiles, scripts, tests, and git status.
2. Label findings **Verified**, **Reported**, **Inferred**, **Proposed**, or **Unknown**.
3. Trace UI → API client → route → middleware → controller/service → model/provider before changing a feature.
4. Make a focused plan, implement the smallest coherent change, add regression tests, and run available checks.
5. Update relevant docs and report evidence, not assumptions.

## Immediate next steps
1. Run a read-only baseline audit and verify the reported frontend cleanup.
2. Confirm/rotate exposed credentials and review git history and deployment secrets.
3. Verify authentication and authorization for REST and Socket.IO events.
4. Establish real tests/build/lint commands for both applications.
5. Choose a secure isolated code execution path before exposing public submissions.
6. Deliver one vertical slice at a time; do not rewrite the entire repository or build all future features in one pass.
