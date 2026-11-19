import axios from "axios";
import { notify } from "../lib/notify";
import {
  clearAcademySession,
  clearTeamSession,
  getAuthToken,
  getAuthTokenForUrl,
  getAcademyToken,
  getTeamToken,
  isAcademyApiPath,
  isTeamApiPath,
} from "./authTokens";

export {
  clearAcademySession,
  clearTeamSession,
  getAuthToken,
  getAuthTokenForUrl,
  getAcademyToken,
  getTeamToken,
  isAcademyApiPath,
  isTeamApiPath,
};

/** Canonical API base URL (includes `/api`). */
export const getApiBaseURL = () =>
  import.meta.env.VITE_API_URL ||
  `${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/api`;

const api = axios.create({
  baseURL: getApiBaseURL(),
  withCredentials: true,
  timeout: 15000,
  timeoutErrorMessage: "Request timed out. Please try again.",
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthTokenForUrl(config.url || "");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const AUTH_FORM_PATHS = [
  "/auth/login",
  "/auth/register",
  "/user/login",
  "/user/register",
  "/user/googleLogin",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";
    const isAuthFormRequest = AUTH_FORM_PATHS.some((p) =>
      requestUrl.includes(p),
    );
    const pathname = window.location.pathname;
    const isAuthPage =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname.startsWith("/academy/");

    if (status === 401 && !isAuthFormRequest && !isAuthPage) {
      if (isTeamApiPath(requestUrl)) {
        clearTeamSession();
        window.location.href = "/login";
      } else if (isAcademyApiPath(requestUrl)) {
        clearAcademySession();
        window.location.href = "/academy/login";
      }
    }

    if (!isAuthFormRequest) {
      notify(error.response?.data?.message || "Network error", "error");
    }
    return Promise.reject(error);
  },
);

export const apiFetch = (path, options = {}) => {
  const token = getAuthTokenForUrl(path);
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
