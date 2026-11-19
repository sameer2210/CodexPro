# CodeX — AI Developer Operating System

This directory is the **canonical project context** for all AI-assisted and multi-agent work on CodeX.

## Mandatory first step (every AI session)

1. Read this file.
2. Read [`AGENTS.md`](AGENTS.md).
3. Read relevant entries under `docs/`, `planning/`, and `ai/` for the task at hand.
4. Inspect the **actual** `Frontend/` and `Backend/` source before changing code.
5. Label findings **Verified**, **Reported**, **Inferred**, **Proposed**, **Implemented**, **Deferred**, or **Blocked**.

Do not treat directory listings or older audit reports as proof that a feature works end-to-end.

## Repository layout

| Path | Role |
|------|------|
| `Frontend/` | React + Vite client |
| `Backend/` | Node + Express API + Socket.IO |
| `CodeX_OS/` | Architecture, rules, memory, decisions (this OS) |

## Operating files

- `AGENTS.md` — enforceable rules for coding agents
- `docs/PRD.md` — product outcomes and non-goals
- `docs/CurrentState.md` — **verified** inventory and module integration status
- `docs/Architecture.md` — current architecture, auth boundaries, clients
- `docs/TechStack.md` — stack facts vs targets
- `docs/API.md` — verified mounts and contracts
- `docs/Security.md`, `docs/Testing.md`, `docs/CodeReview.md`, `docs/Design.md`
- `docs/Database.md`, `docs/Deployment.md`
- `planning/Phases.md`, `planning/Tasks.md` — delivery order / backlog
- `planning/KnownIssues.md` — risk register
- `planning/Decisions.md` — ADRs
- `ai/Memory.md` — concise handoff (never a substitute for inspection)

## Verification commands

```bash
# Frontend
cd Frontend && npm run lint && npm run build

# Backend
cd Backend && npm run lint
node --check server.js
node --check src/app.js
npm test   # Jest; currently passWithNoTests
```

## Immediate engineering priorities

See `planning/Tasks.md` and `ai/Memory.md` for the latest verified status after the architecture stabilization pass.
