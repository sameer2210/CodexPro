import axios from "axios";
import { notify } from "../lib/notify";

/** Canonical API base URL (includes `/api`). */
export const getApiBaseURL = () =>
  import.meta.env.VITE_API_URL ||
  `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api`;

/**
 * Shared token lookup used by axios interceptors and SSE fetch callers.
 * Prefer codex_token; fall back to legacy `token`.
 */
export const getAuthToken = () =>
  localStorage.getItem("codex_token") || localStorage.getItem("token");

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  timeout: 15000,
  timeoutErrorMessage: "Request timed out. Please try again.",
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/user/login") ||
      requestUrl.includes("/user/register");
    const isAuthPage =
      window.location.pathname === "/login" ||
      window.location.pathname === "/register";

    if (status === 401 && !isAuthRequest && !isAuthPage) {
      localStorage.clear();
      window.location.href = "/login";
    }

    notify(error.response?.data?.message || "Network error", "error");
    return Promise.reject(error);
  },
);

/**
 * Authenticated fetch for SSE / streaming endpoints where axios is unsuitable.
 * Shares base URL and token conventions with the canonical axios instance.
 */
export const apiFetch = (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const url = path.startsWith("http")
    ? path
    : `${getApiBaseURL()}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });
};

export const axiosClient = api;
export default api;
