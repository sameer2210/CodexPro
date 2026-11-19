# CodeX Architecture Decision Records

## ADR template
### ADR-NNN: Decision title
- **Status:** Proposed / Accepted / Superseded
- **Date:**
- **Context:**
- **Decision:**
- **Alternatives:**
- **Trade-offs:**
- **Security/privacy impact:**
- **Migration/rollback:**
- **Evidence and verification:**

---

### ADR-001: Preserve dual authentication systems
- **Status:** Accepted
- **Date:** 2026-11-20
- **Context:** Team JWT (`/api/auth`, projects, sockets) and User JWT (`/api/user`, academy, contests, AI) coexist with different models and consumers.
- **Decision:** Do not unify in the stabilization pass. Fix token/contract bugs within each system. Document ownership clearly.
- **Alternatives:** unifiedAuth + `src/modules/identity` (exists but unwired).
- **Trade-offs:** Academy users cannot join team sockets without a team session; simpler than a risky migration.
- **Evidence:** `auth.routes.js`, `userAuth.js`, `authSlice`, `AuthContext`, `server.js` handshake.

### ADR-002: Split IDE dashboard vs learning stats
- **Status:** Accepted
- **Date:** 2026-11-20
- **Context:** `views/Dashboard.jsx` is the IDE/projects home; orphaned `DashboardPage` is analytics UI.
- **Decision:** Keep `/dashboard` for IDE. Reconnect analytics as `/stats` after repairing API mapping. Do not replace IDE dashboard.
- **Evidence:** Routes + DashboardPage Promise.allSettled repair.

### ADR-003: AI router ownership
- **Status:** Accepted
- **Date:** 2026-11-20
- **Context:** Both `AiChat.js` and `aiInterview.js` mounted at `/api/ai` with duplicate `/chat` and `/assistant`.
- **Decision:** Chat/assistant owned only by `AiChat.js`. Interview-only routes remain on `aiInterview.js`. Assistant accepts POST body `{ query }` (legacy query string still accepted).
- **Evidence:** Removed duplicate handlers from `aiInterview.js`; FE uses `apiFetch` POST.

### ADR-004: Vite public static assets
- **Status:** Accepted
- **Date:** 2026-11-20
- **Context:** `publicDir: "../public"` pointed at a missing folder; UI references `/logo.png`.
- **Decision:** Use `Frontend/public/` with `logo.png` copied from `Frontend/assets/logo.png`. Do not remount entire `assets/` as publicDir.
- **Deferred:** `/og-image.png` still missing.

### ADR-005: File moves during stabilization
- **Status:** Accepted
- **Date:** 2026-11-20
- **Decision:** No application source files were moved. Reconnect via routes and import fixes only.

---

## Decisions still open
1. Code execution provider vs self-managed isolated workers.
2. Collaboration protocol and persistence model evolution.
3. AI provider budgets and rate limits.
4. Contest scoring and tie-breakers.
5. Whether to wire `src/modules/**` / unifiedAuth as the long-term identity model.
6. Audio/video TURN deployment.
7. Payment/premium production scope.
