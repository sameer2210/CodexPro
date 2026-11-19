import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAcademySession,
  clearTeamSession,
  getAuthTokenForUrl,
} from "./authTokens";

const store = {};

vi.stubGlobal("localStorage", {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => {
    delete store[k];
  },
  clear: () => {
    Object.keys(store).forEach((k) => delete store[k]);
  },
});

describe("authTokens isolation", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
  });

  it("selects team token for collaboration paths", () => {
    store.codex_token = "team-jwt";
    store.academy_token = "academy-jwt";
    expect(getAuthTokenForUrl("/projects/get-all")).toBe("team-jwt");
    expect(getAuthTokenForUrl("/auth/login")).toBe("team-jwt");
    expect(getAuthTokenForUrl("/messages/history")).toBe("team-jwt");
  });

  it("selects academy token for academy paths", () => {
    store.codex_token = "team-jwt";
    store.academy_token = "academy-jwt";
    expect(getAuthTokenForUrl("/user/getProfile")).toBe("academy-jwt");
    expect(getAuthTokenForUrl("/problem/getAllProblems")).toBe("academy-jwt");
    expect(getAuthTokenForUrl("/ai/chat")).toBe("academy-jwt");
  });

  it("clearAcademySession does not remove team keys", () => {
    store.codex_token = "team-jwt";
    store.codex_team = "Demo";
    store.academy_token = "academy-jwt";
    store.academy_user = "{}";
    clearAcademySession();
    expect(store.academy_token).toBeUndefined();
    expect(store.codex_token).toBe("team-jwt");
    expect(store.codex_team).toBe("Demo");
  });

  it("clearTeamSession does not remove academy keys", () => {
    store.codex_token = "team-jwt";
    store.academy_token = "academy-jwt";
    clearTeamSession();
    expect(store.codex_token).toBeUndefined();
    expect(store.academy_token).toBe("academy-jwt");
  });
});
