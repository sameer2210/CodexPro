# CodeX Code Review Checklist

## Correctness
- Does the change meet acceptance criteria?
- Are edge cases and failure states handled?
- Are API/data contracts preserved or intentionally migrated?
- Are concurrency, retries, duplicate events, and stale state handled?

## Security/privacy
- Is authorization enforced server-side for each resource and sensitive event?
- Are inputs, payload sizes, execution costs, and AI requests bounded?
- Are secrets or private data exposed in code, logs, responses, or prompts?
- Can a client forge identity, ownership, score, or acceptance?
- Are injection, XSS, SSRF, or unsafe execution risks introduced?

## Maintainability
- Is the code cohesive and readable?
- Is logic duplicated? Is an abstraction justified?
- Are types/contracts/names clear?
- Do comments explain why rather than repeat the code?

## Performance/reliability
- Are queries bounded and indexed where appropriate?
- Are timeouts, cancellation, and failures handled?
- Is unbounded memory/work introduced?
- Does collaboration preserve synchronization/reconnect behavior?

## UX/accessibility
- Are loading, empty, error, offline, and disabled states clear?
- Does keyboard navigation work?
- Is layout responsive?
- Are AI feedback and rankings explainable?

## Verification
- Which tests/checks actually ran?
- What failed or remains unverified?
- Are docs and memory consistent with actual results?

## Outcome
- Blocking issues:
- Important issues:
- Minor improvements:
- Evidence:
- Decision: Approve / Request changes / Needs investigation

# CodeX Backend — Production Code Review Process

## 1. Overview

CodeX uses AI-assisted code review as a mandatory quality gate for every Pull Request.

The review is performed after a developer raises a PR and before the PR is approved for merge.

AI-assisted review is a **code quality and risk assessment process**, not a replacement for automated tests, manual QA, security testing, or production monitoring.

Every review must evaluate the existing CodeX architecture, API contracts, database structure, authentication, real-time communication, and frontend compatibility.

### Project Technology Standards

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | JavaScript (ES Modules) |
| Backend framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password security | bcryptjs |
| Real-time communication | Socket.IO |
| Video/audio signaling | WebRTC + Socket.IO |
| AI integration | Existing configured Google GenAI integration; verify actual provider implementation |
| Security | Helmet, CORS, rate limiting, input validation |
| Frontend | React, Vite, Redux Toolkit, Monaco Editor |
| Notifications | Sonner |
| Deployment | Node.js hosting + MongoDB Atlas |

Do not introduce a different technology or architecture without a technical justification and approval.

---

## 2. CodeX Product Scope

The reviewer must understand the actual application before evaluating changes.

### 2.1 Authentication and Team Management

Existing functionality:

- Team registration.
- Team-based login.
- First team member receives administrator privileges.
- Additional team members can join.
- JWT authentication.
- Token verification.
- Logout and activity tracking.
- Active team member listing.
- Team-scoped authorization.

Review requirements:

- A user must never access another team's resources.
- Passwords must never be returned in API responses.
- Passwords must be hashed using a secure password hashing algorithm.
- JWT secrets must come from environment configuration.
- Invalid or expired tokens must be rejected.
- User privileges must be verified against authoritative database state.
- Duplicate team names and usernames must be handled correctly.
- Concurrent registration and membership changes must not create duplicate records.
- Logout and activity tracking must behave correctly with multiple sessions and connections.

### 2.2 Project Management

Existing functionality:

- Create projects.
- Fetch all team projects.
- Fetch individual projects.
- Update project code.
- Store AI review results.
- Collaborate with team members.

Review requirements:

- Every project must belong to an authenticated team.
- Every project lookup and modification must enforce team ownership.
- Project IDs must be validated before database operations.
- Project names must be validated and normalized.
- Project updates must use an explicit allowlist of fields.
- Users must not overwrite privileged or internal fields.
- Large source-code payloads must be limited.
- Concurrent code updates must not silently overwrite newer changes.
- Project deletion and archival must preserve required relationships and history.

### 2.3 Real-Time Collaboration

Existing functionality:

- Socket.IO authentication.
- Team rooms.
- Project rooms.
- Code synchronization.
- Live chat.
- User presence.
- WebRTC signaling.
- Audio/video calling.

Review requirements:

- Socket connections must be authenticated.
- Invalid JWTs must be rejected, not silently accepted.
- Project room access must be authorized using database ownership.
- Events must be validated before processing.
- Users must only receive events they are authorized to access.
- Room membership must be cleaned up correctly.
- Socket listeners must not leak.
- Reconnection must not produce duplicate presence events.
- Multiple tabs and devices must not corrupt online status.
- WebRTC signaling must verify sender, recipient and team membership.
- Arbitrary socket IDs must not allow unauthorized signaling.
- Disconnect handling must not incorrectly mark a user offline while another session remains connected.

### 2.4 AI Integration

Existing functionality:

- AI-assisted code review.
- Saving review results against projects.
- Returning review results to the frontend.

Review requirements:

- API credentials must never be exposed to clients.
- AI requests must be authenticated and rate-limited.
- Input size and token consumption must be controlled.
- Provider failures and quota exhaustion must be handled.
- Timeouts must not leave requests hanging.
- AI output must be treated as untrusted content.
- AI-generated code must not be executed automatically.
- Review results must be associated with the correct project and team.
- Failed AI requests must not overwrite a previous successful review.
- Sensitive information must not be sent to external AI providers unnecessarily.

---

## 3. Authoritative Code Standards

The following rules are mandatory.

### 3.1 Architecture

CodeX follows a modular, layered Express.js architecture.

Canonical backend structure:

```text
Backend/
├── server.js
├── package.json
├── .env
├── .env.example
├── eslint.config.js
├── docs/
├── tests/
└── src/
    ├── app.js
    ├── config/
    │   └── config.js
    ├── db/
    │   └── db.js
    ├── controllers/
    │   ├── auth.controllers.js
    │   └── project.controllers.js
    ├── middlewares/
    │   ├── authMiddleware.js
    │   ├── errorMiddleware.js
    │   └── validationMiddleware.js
    ├── models/
    │   ├── team.model.js
    │   ├── project.model.js
    │   └── message.model.js
    ├── routes/
    │   ├── auth.routes.js
    │   └── project.routes.js
    ├── services/
    │   ├── auth.service.js
    │   ├── project.service.js
    │   └── ai.service.js
    ├── sockets/
    │   ├── index.js
    │   ├── middleware/
    │   ├── handlers/
    │   └── services/
    ├── validators/
    │   ├── auth.validator.js
    │   └── project.validator.js
    ├── utils/
    │   ├── errors.js
    │   ├── responses.js
    │   └── constants.js
    └── jobs/
```

This is the target structure, not an instruction to move every existing file immediately.

Rules:

- Do not create duplicate implementations of existing modules.
- Do not create unnecessary nested folders.
- Do not introduce alternative architecture patterns without justification.
- Keep existing working functionality.
- Migrate legacy code incrementally.
- New functionality must follow the agreed target architecture.
- Socket.IO event handlers must be separated from HTTP controllers.
- Shared infrastructure must not depend on feature-specific business logic.

### 3.2 Layer Responsibilities

| Layer | Responsibility | Must not contain |
|---|---|---|
| Routes | Route definitions and middleware wiring | Database queries and business logic |
| Controllers | HTTP request/response handling | Direct database/business workflows |
| Services | Business logic and persistence coordination | Express `req` and `res` |
| Models | Mongoose schemas, methods and indexes | HTTP logic |
| Validators | Request validation and sanitization | Database business workflows |
| Middleware | Authentication, authorization, validation and error handling | Feature-specific workflows |
| Socket handlers | Socket event processing and authorization | Unrestricted database access |
| Socket services | Real-time business operations | Direct client transport management |
| Config | Environment configuration | Hardcoded secrets |

### 3.3 Naming Conventions

- Variables and functions: camelCase.
- Classes and React components: PascalCase.
- Model files: resource-based `.model.js`.
- Service files: resource-based `.service.js`.
- Controller files: resource-based `.controllers.js` or the existing agreed naming convention.
- Route files: resource-based `.routes.js`.
- Constants: UPPER_SNAKE_CASE.
- Environment variables: UPPER_SNAKE_CASE.
- URL paths: kebab-case.
- Relative ES module imports must include `.js` extensions.

### 3.4 Import Boundaries

- Controllers may import their relevant services.
- Services may import models and shared utilities.
- Routes may import controllers and middleware.
- Models must not import controllers or routes.
- Shared infrastructure must not import feature-specific controllers.
- Socket handlers must use authorized service operations.
- Avoid circular dependencies.
- Do not introduce duplicate database connections.

---

## 4. Mandatory PR Review Workflow

```text
Development
    |
    v
Developer Testing
    |
    v
PR Created
    |
    v
AI Code Review — Run 1
    |
    v
Developer Resolves Findings
    |
    v
AI Code Review — Run 2
    |
    v
Automated CI Checks
    |
    v
Manual QA
    |
    v
Reviewer / PM Approval
    |
    v
Merge
    |
    v
Production Deployment
    |
    v
Post-deployment Verification
```

### Rules

1. Every feature, bug fix, refactor and database change requires review.
2. Developer must provide the PR description and associated task requirements.
3. Reviewer must inspect the complete changed-file diff.
4. Reviewer must inspect related existing code where necessary.
5. All Critical findings must be fixed.
6. Warnings must be fixed or justified.
7. AI review must be repeated after fixes.
8. Automated tests must pass.
9. No production credentials may be committed.
10. No unreviewed database migration or destructive data operation may be merged.

A passing AI review does not automatically approve a PR.

---

# 5. Mandatory Review Areas

## Area 1 — Architecture and Code Quality

Check:

- Consistent layered architecture.
- Correct folder and file placement.
- Single responsibility.
- No duplicate services or models.
- No circular imports.
- No unnecessary abstraction.
- Correct ES module imports.
- No business logic inside route definitions.
- Controllers remain thin.
- Services do not depend on HTTP request/response objects.
- Shared code is reused instead of duplicated.
- No breaking API changes without frontend coordination.
- ESLint and Prettier compliance.
- No unnecessary large files or deeply nested logic.

Critical violations:

- New code bypasses authentication or authorization layers.
- Business logic is implemented directly inside routes.
- Cross-team data access is possible.
- Database operations are duplicated in multiple architectural layers.
- New code breaks an existing API contract without migration planning.

Warnings:

- Excessively large files.
- Repeated code.
- Unnecessary abstractions.
- Missing separation of responsibilities.

## Area 2 — Database Architecture and Data Integrity

MongoDB and Mongoose must be reviewed as first-class production components.

### Schema design

Check:

- Correct BSON types.
- Required fields.
- Defaults.
- Enum constraints.
- String trimming and normalization.
- Appropriate field validation.
- Appropriate timestamps.
- Relationship consistency.
- Embedded document size.
- Schema versioning where needed.

### Indexing

Check:

- Unique indexes.
- Compound indexes.
- Team-scoped indexes.
- Project lookup indexes.
- Message history indexes.
- Query sort compatibility.
- Index duplication.
- Index creation and deployment impact.

Expected index patterns must be derived from actual queries.

Examples:

```javascript
// Projects
{ teamId: 1, updatedAt: -1 }

// Messages
{ teamId: 1, projectId: 1, timestamp: -1 }

// Team lookup
{ teamName: 1 } // unique when appropriate
```

These are examples, not blindly mandatory indexes. Verify the actual schema and query patterns before adding them.

### Data integrity

Check:

- Duplicate record prevention.
- Concurrent updates.
- Race conditions.
- Referential consistency.
- Orphaned records.
- Delete behavior.
- Atomic updates.
- Transaction requirements.
- Data migration compatibility.
- Backup and restore compatibility.

### Performance

Check:

- N+1 query patterns.
- Unbounded `.find()` operations.
- Missing pagination.
- Unnecessary `.populate()`.
- Over-fetching fields.
- Missing `.lean()` where suitable.
- Inefficient array searches.
- Large embedded arrays.
- Collection growth.
- Slow aggregation pipelines.

Critical:

- Cross-team database access.
- Data corruption.
- Destructive migration without recovery.
- Missing indexes causing serious production query degradation.
- Unbounded data retrieval on large collections.

## Area 3 — Authentication and Security

Security findings are always Critical when exploitable.

### Authentication

- JWT signature verification.
- Expiration validation.
- Secret strength.
- Token storage and exposure.
- Token invalidation strategy.
- Socket authentication.
- Multiple-session behavior.
- Password hashing.
- Brute-force protection.
- Account and team membership checks.

### Authorization

- Team-level isolation.
- Project ownership.
- Member permissions.
- Admin-only actions.
- Resource ID authorization.
- Privilege escalation.
- Client-controlled roles.
- Socket room authorization.
- WebRTC signaling authorization.

### API Security

- Input validation.
- NoSQL injection.
- XSS.
- Prototype pollution.
- Mass assignment.
- Request size limits.
- Rate limiting.
- CORS restrictions.
- Security headers.
- Error information leakage.
- PII exposure.

### Secrets

Never commit:

- JWT secrets.
- Database credentials.
- AI API keys.
- Private access tokens.
- Production environment files.

Check that `.env` is ignored by Git and `.env.example` contains only placeholder values.

## Area 4 — API Contracts and Backend Integration

Check every affected API against its actual frontend usage.

Existing API surfaces:

```text
/api/auth
/api/projects
```

Existing functionality includes:

- Authentication.
- Team members.
- Team activity.
- Team messages.
- Project CRUD.
- AI project review.

Review:

- HTTP methods.
- Request body structure.
- Query parameters.
- Path parameters.
- Response structure.
- Status codes.
- Validation errors.
- Authentication requirements.
- Authorization requirements.
- Pagination.
- Sorting.
- Backward compatibility.

Existing response convention:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": {}
}
```

Errors must use consistent status codes and response structures.

Expected status codes:

| Scenario | Status |
|---|---:|
| Successful GET | 200 |
| Resource created | 201 |
| Invalid request | 400 |
| Missing authentication | 401 |
| Unauthorized operation | 403 |
| Resource not found | 404 |
| Duplicate resource | 409 |
| Rate limit exceeded | 429 |
| Unexpected server error | 500 |
| Temporary service unavailable | 503 |

Do not change existing response contracts without checking all affected frontend consumers.

## Area 5 — Socket.IO and Real-Time Collaboration

This area is mandatory for any change affecting real-time features.

### Connection lifecycle

- JWT authentication.
- Invalid-token rejection.
- Connection limits.
- Reconnection.
- Disconnect handling.
- Multiple devices.
- Multiple tabs.
- User presence.
- Session cleanup.

### Team rooms

- Authenticated team membership.
- Correct room naming.
- No arbitrary room joining.
- No cross-team broadcasting.
- Proper leave/disconnect handling.

### Project collaboration

- Project ownership verification.
- Project room authorization.
- Code-change payload validation.
- Cursor position validation.
- Large payload handling.
- Concurrent code editing.
- Event ordering.
- Reconnection synchronization.
- Stale update protection.

### Chat

- Message validation.
- Authentication.
- Project/team authorization.
- Persistence.
- Duplicate message prevention.
- Message ordering.
- Pagination.
- Rate limiting.
- Appropriate acknowledgements.
- Delivery failure handling.

### WebRTC

- Caller authorization.
- Recipient authorization.
- Correct socket mapping.
- Offer/answer delivery.
- ICE candidate delivery.
- Call rejection.
- Call termination.
- Offline recipient handling.
- Reconnection behavior.
- Cleanup after disconnect.

### Multi-instance deployment

Review whether the architecture requires:

- Socket.IO Redis adapter.
- Shared presence state.
- Distributed user-to-socket mapping.
- Sticky sessions where required.
- Graceful shutdown.

Do not claim multi-instance support when state exists only in local Maps or memory.

## Area 6 — AI Integration

Check:

- Correct provider configuration.
- API key protection.
- Model availability.
- Provider quotas.
- Request timeouts.
- Retry strategy.
- Exponential backoff where appropriate.
- Input size limits.
- Cost controls.
- Prompt injection risks.
- Output validation.
- Safe error handling.
- Project ownership.
- Review history preservation.

AI provider failures must not crash the backend.

Do not retry non-retryable errors indefinitely.

## Area 7 — Error Handling and Reliability

Check:

- Async error propagation.
- Centralized error middleware.
- Unhandled promise rejections.
- Uncaught exceptions.
- MongoDB disconnections.
- Database readiness.
- Graceful server shutdown.
- Socket server shutdown.
- Request timeouts.
- External API failures.
- Consistent error responses.
- Safe logging.

The server must not accept normal traffic before required dependencies are ready.

Do not expose internal stack traces in production responses.

## Area 8 — Performance and Scalability

Check:

- Database indexes.
- Query execution plans.
- Pagination.
- Payload limits.
- Socket event frequency.
- Memory usage.
- Event listener cleanup.
- CPU-intensive operations.
- AI API latency.
- Request rate limits.
- Horizontal scaling.
- Connection pool configuration.
- Caching only where beneficial.

Performance findings must include evidence or a measurable risk, not merely stylistic preferences.

## Area 9 — Testing and Regression Prevention

Every changed feature must have relevant tests.

### Unit tests

- Service functions.
- Validation rules.
- Authorization helpers.
- Error handling.
- Data transformations.

### Integration tests

- API routes.
- Controllers.
- Database operations.
- Authentication.
- Team isolation.
- Project ownership.

### Socket tests

- Authenticated connections.
- Invalid JWT rejection.
- Team room isolation.
- Project room authorization.
- Chat persistence.
- Code synchronization.
- Multiple connections.
- WebRTC signaling authorization.
- Disconnect cleanup.

### Regression tests

Test existing behavior affected by the changes.

Minimum scenarios:

1. Valid user login.
2. Invalid credentials.
3. Expired JWT.
4. Unauthorized team access.
5. Unauthorized project access.
6. Duplicate project creation.
7. Invalid project ID.
8. Database unavailable.
9. AI provider unavailable.
10. Socket reconnect.
11. Two users editing simultaneously.
12. Multiple tabs for the same user.
13. User disconnect while another session remains active.
14. Large or malformed request payload.
15. Rate limit exceeded.

Tests must verify actual behavior. Do not mark tests as passed merely because the test files exist.

## Area 10 — Dead Code, Logging and Configuration

Check:

- `console.log` debugging.
- Unused imports.
- Unused variables.
- Commented-out implementations.
- Duplicate functions.
- Dead routes.
- Temporary scripts.
- Hardcoded URLs.
- Hardcoded secrets.
- Environment fallbacks.
- Missing configuration validation.
- Incorrect development/production configuration.

Production logging must be structured and must not expose passwords, tokens, private code or sensitive user data.

---

# 6. Severity Classification

| Severity | Meaning | Required action |
|---|---|---|
| Critical | Security vulnerability, data corruption, unauthorized access, broken core functionality | Must fix before approval |
| High | Significant functional, integration or reliability issue | Must fix before approval |
| Medium | Performance, maintainability or edge-case risk | Fix or obtain documented approval |
| Low | Minor maintainability or cleanup issue | Track and justify |

Security vulnerabilities, cross-team data exposure, secret leakage and destructive database operations are always Critical.

A warning must not be downgraded simply to achieve a passing review.

### Finding format

Every finding must contain:

- Area.
- Severity.
- File and line number.
- Root cause.
- Actual impact.
- Reproduction scenario.
- Recommended fix.
- Regression risks.
- Fix applied: Yes/No.
- Verification evidence.

Do not report speculative problems as confirmed bugs. Clearly distinguish confirmed issues from risks requiring runtime verification.

---

# 7. Mandatory AI Review Prompt

Use the following prompt for every PR.

```text
You are a Senior Backend Architect, Application Security Engineer,
MongoDB Database Architect and QA Engineer reviewing the CodeX project.

PROJECT:
CodeX — Collaborative AI-powered online code editor.

TECHNOLOGY:
- Node.js
- JavaScript ES Modules
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Socket.IO
- WebRTC signaling
- Google GenAI integration (verify actual implementation)
- React frontend
- Monaco Editor

OBJECTIVE:

Perform a production-grade review of the complete PR.

Do not make assumptions about the architecture.
First inspect the actual repository structure, package.json,
environment configuration, models, routes, controllers, services,
middleware, sockets, tests and README.

IMPORTANT RULES:

1. Preserve existing working functionality.
2. Do not blindly refactor unrelated files.
3. Do not invent new folder structures.
4. Follow the existing layered architecture and approved target structure.
5. Do not introduce duplicate implementations.
6. Never remove code simply because it looks unused without
   checking its imports and runtime usage.
7. Never change an API contract without inspecting frontend consumers.
8. Never make destructive database changes without a migration plan.
9. Do not expose secrets or personal data.
10. Do not claim tests passed without executing them.

REVIEW THE FOLLOWING AREAS:

1. Architecture and code quality.
2. MongoDB schema design and database integrity.
3. Authentication and authorization.
4. API contracts and frontend compatibility.
5. Socket.IO and WebRTC security.
6. AI integration.
7. Error handling and reliability.
8. Performance and scalability.
9. Automated testing and regression prevention.
10. Dead code, logging and configuration.

SPECIFIC SECURITY REQUIREMENTS:

- Verify every team-scoped database query.
- Verify project ownership independently.
- Verify JWT authentication for HTTP and sockets.
- Reject invalid socket authentication.
- Validate socket event payloads.
- Verify sender and recipient permissions for WebRTC.
- Prevent unauthorized room access.
- Check mass assignment and NoSQL injection.
- Verify CORS and rate limiting.
- Check secrets and environment configuration.

DATABASE REQUIREMENTS:

- Inspect all existing Mongoose models.
- Identify missing or incorrect indexes.
- Check unique constraints and duplicate handling.
- Check embedded array growth.
- Check pagination and query performance.
- Check concurrent writes and race conditions.
- Check referential integrity.
- Check migrations and existing production data compatibility.

FRONTEND COMPATIBILITY:

Inspect all affected frontend API calls, Redux state,
authentication handling, Socket.IO events and payload contracts.

Preserve:
- Existing API paths unless migration is justified.
- Existing response structures.
- Authentication behavior.
- Real-time event names.
- Code synchronization behavior.
- Chat behavior.
- WebRTC behavior.
- AI review functionality.

TESTING:

Identify and execute applicable:
- Lint checks.
- Unit tests.
- API integration tests.
- Database tests.
- Socket.IO tests.
- Security tests.
- Regression tests.
- Production build checks where applicable.

For every issue, report:
- Severity.
- Exact file and line.
- Root cause.
- Impact.
- Reproduction scenario.
- Recommended fix.
- Regression risk.
- Whether it was verified.

Separate:
A. Confirmed issues.
B. Potential risks.
C. Missing tests.
D. Items requiring manual verification.

Do not mark an untested feature as verified.

OUTPUT:

Return a complete structured report with all ten review areas.

Explicitly include:

- Architecture compatibility.
- Database integrity.
- Team isolation.
- API compatibility.
- Socket security.
- AI provider reliability.
- Production readiness.
- Test execution results.

End with:

Overall Status: PASS / FAIL / CONDITIONAL

Critical Findings: [count]
High Findings: [count]
Medium Findings: [count]
Low Findings: [count]

All Critical Resolved: Yes/No
All High Resolved: Yes/No
Tests Executed: [details]
Tests Passed: [details]
Tests Failed: [details]
Manual Verification Required: [details]

Ready for Merge: Yes/No

Never report PASS when unresolved blocking findings remain.
```

---

# 8. Structured PR Review Summary

Post the following report as a PR comment.

```markdown
# CodeX Code Review — [PR Number] [Feature Name]

**Date:** YYYY-MM-DD
**Branch:** feature/branch-name
**Reviewed by:** Developer Name
**Review Run:** 1
**Commit:** [Commit SHA]

**Architecture Reviewed:** Yes/No
**Overall Status:** PASS / FAIL / CONDITIONAL

---

## 1. Architecture and Code Quality
- Status:
- Critical:
- High:
- Medium:
- Low:
- Findings:
- Fixes:

## 2. Database and Data Integrity
- Status:
- Schema changes:
- Index changes:
- Migration safety:
- Findings:
- Fixes:

## 3. Authentication and Security
- Status:
- Team isolation:
- Project authorization:
- JWT validation:
- Findings:
- Fixes:

## 4. API and Frontend Compatibility
- Status:
- API contracts preserved:
- Response compatibility:
- Findings:
- Fixes:

## 5. Socket.IO and WebRTC
- Status:
- Socket authentication:
- Room authorization:
- Event validation:
- WebRTC authorization:
- Findings:
- Fixes:

## 6. AI Integration
- Status:
- Provider configuration:
- Error handling:
- Rate limiting:
- Findings:
- Fixes:

## 7. Error Handling and Reliability
- Status:
- Database failure handling:
- External dependency handling:
- Graceful shutdown:
- Findings:
- Fixes:

## 8. Performance and Scalability
- Status:
- Query optimization:
- Indexing:
- Pagination:
- Socket scalability:
- Findings:
- Fixes:

## 9. Testing and Regression
- Status:
- Unit tests:
- Integration tests:
- Socket tests:
- Regression tests:
- Execution evidence:

## 10. Dead Code and Configuration
- Status:
- Debug logs:
- Unused code:
- Secret handling:
- Findings:
- Fixes:

---

## Summary

| Area | Status | Critical | High | Medium | Low |
|---|---|---:|---:|---:|---:|
| Architecture | PASS/FAIL | 0 | 0 | 0 | 0 |
| Database | PASS/FAIL | 0 | 0 | 0 | 0 |
| Security | PASS/FAIL | 0 | 0 | 0 | 0 |
| API Integration | PASS/FAIL | 0 | 0 | 0 | 0 |
| Socket/WebRTC | PASS/FAIL | 0 | 0 | 0 | 0 |
| AI Integration | PASS/FAIL | 0 | 0 | 0 | 0 |
| Reliability | PASS/FAIL | 0 | 0 | 0 | 0 |
| Performance | PASS/FAIL | 0 | 0 | 0 | 0 |
| Testing | PASS/FAIL | 0 | 0 | 0 | 0 |
| Dead Code | PASS/FAIL | 0 | 0 | 0 | 0 |

**All Critical Findings Resolved:** Yes/No
**All High Findings Resolved:** Yes/No
**Medium/Low Justifications:** [Details]
**Tests Actually Executed:** [Details]
**Manual Verification Required:** [Details]

**Ready for Merge:** Yes/No
```

---

# 9. PASS / FAIL Criteria

### PASS

- All ten areas reviewed.
- No unresolved Critical findings.
- No unresolved High findings.
- Medium and Low findings fixed or documented and accepted.
- Database changes reviewed.
- Frontend compatibility checked.
- Security checks completed.
- Required tests executed successfully.
- No unverified claims presented as test results.
- PR review summary posted.

### FAIL

- Any unresolved Critical finding.
- Any unresolved High finding.
- Team or project authorization bypass.
- Hardcoded secrets.
- Data corruption risk.
- Breaking frontend API contract without an approved migration.
- Invalid Socket.IO authentication.
- Unauthorized real-time communication.
- Destructive database changes without a recovery plan.
- Required tests failing.
- Review report missing.

### CONDITIONAL

Use only when a genuine verification dependency remains, such as unavailable production infrastructure, missing external credentials or an unavailable real-device environment.

Conditional is not approval to merge. The outstanding verification must be completed by the responsible reviewer before approval.

---

# 10. Re-Review Rules

Whenever a new commit is pushed:

1. Review the latest complete diff.
2. Recheck previously identified findings.
3. Verify that fixes do not introduce regressions.
4. Re-run affected tests.
5. Re-run security checks where applicable.
6. Update the existing PR review summary.
7. Increment the review run number.

Do not assume an earlier passing review remains valid after additional code changes.

---

# 11. Production Release Requirements

Before deployment, verify:

- Production environment variables.
- Strong JWT secret.
- MongoDB Atlas connectivity.
- Database indexes.
- CORS allowlist.
- HTTPS and secure WebSocket transport.
- Rate limiting.
- Request size limits.
- Logging and error monitoring.
- Database backups.
- Recovery procedure.
- Graceful shutdown.
- Health and readiness endpoints.
- AI provider availability.
- Socket.IO deployment compatibility.
- Frontend/backend environment configuration.

Production deployment must have a rollback strategy.

After deployment, verify authentication, project access, collaboration, messaging and AI review using production-safe test accounts.

---

# 12. Final Rules

1. AI review is mandatory for every PR.
2. The review must be based on actual repository code.
3. Existing functionality must be preserved.
4. New code must follow the agreed CodeX architecture.
5. Security and team isolation take priority.
6. MongoDB changes require explicit data integrity review.
7. Socket.IO and WebRTC require dedicated security review.
8. Frontend contracts must be checked before backend changes are approved.
9. Tests must be executed, not assumed.
10. No Critical or High finding may remain open at merge approval.
11. Warnings must have documented resolutions or accepted justifications.
12. No developer or AI reviewer may claim production readiness without sufficient verification evidence.

**CodeX Review Principle:**

Production readiness means correctness, security, data integrity, backward compatibility, reliability, observability and verified behavior — not simply a successful build or zero ESLint errors.
