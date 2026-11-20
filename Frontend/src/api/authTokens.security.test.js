import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAcademySession,
  clearTeamSession,
  getAuthTokenForUrl,
  isAcademyApiPath,
  isTeamApiPath,
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

describe("scoped 401 / token domain boundaries", () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    store.codex_token = "team-jwt";
    store.academy_token = "academy-jwt";
  });

  it("classifies team vs academy API paths", () => {
    expect(isTeamApiPath("/projects/abc")).toBe(true);
    expect(isTeamApiPath("/webrtc/turn")).toBe(true);
    expect(isAcademyApiPath("/user/login")).toBe(true);
    expect(isAcademyApiPath("/contest/today")).toBe(true);
    expect(isTeamApiPath("/user/login")).toBe(false);
    expect(isAcademyApiPath("/projects/abc")).toBe(false);
  });

  it("never returns the opposite domain token for a classified path", () => {
    expect(getAuthTokenForUrl("/projects/x")).not.toBe("academy-jwt");
    expect(getAuthTokenForUrl("/user/getProfile")).not.toBe("team-jwt");
  });

  it("simulates academy 401 cleanup without wiping team session", () => {
    clearAcademySession();
    expect(store.academy_token).toBeUndefined();
    expect(store.codex_token).toBe("team-jwt");
  });

  it("simulates team 401 cleanup without wiping academy session", () => {
    clearTeamSession();
    expect(store.codex_token).toBeUndefined();
    expect(store.academy_token).toBe("academy-jwt");
  });
});
