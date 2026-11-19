const TEAM_PREFIXES = ["/auth", "/projects", "/messages", "/webrtc"];
const ACADEMY_PREFIXES = [
  "/user",
  "/problem",
  "/submission",
  "/contest",
  "/playlists",
  "/discussions",
  "/ai",
  "/payments",
  "/dsa",
  "/video",
];

export const normalizeApiPath = (url = "") => {
  try {
    if (url.startsWith("http")) {
      return new URL(url).pathname.replace(/^\/api/, "") || url;
    }
  } catch {
    /* ignore */
  }
  return url.startsWith("/api") ? url.slice(4) : url;
};

export const isTeamApiPath = (url = "") => {
  const path = normalizeApiPath(url);
  return TEAM_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

export const isAcademyApiPath = (url = "") => {
  const path = normalizeApiPath(url);
  return ACADEMY_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
};

export const getTeamToken = () => localStorage.getItem("codex_token");

export const getAcademyToken = () => localStorage.getItem("academy_token");

export const getAuthTokenForUrl = (url = "") => {
  if (isTeamApiPath(url)) return getTeamToken();
  if (isAcademyApiPath(url)) return getAcademyToken();
  return getAcademyToken() || getTeamToken();
};

export const getAuthToken = () => getAcademyToken() || getTeamToken();

export const clearTeamSession = () => {
  localStorage.removeItem("codex_token");
  localStorage.removeItem("codex_team");
  localStorage.removeItem("codex_username");
};

export const clearAcademySession = () => {
  localStorage.removeItem("academy_token");
  localStorage.removeItem("academy_user");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
