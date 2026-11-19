import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, logout as reduxLogout } from "../store/slices/authSlice";
import axiosClient from "../utils/axiosClient";

const AuthContext = createContext();

const readLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

/**
 * AuthContext bridges two preserved identity systems:
 * - Team/collab: Redux authSlice + /api/auth (username/teamName)
 * - User/academy: localStorage user + /api/user (emailId/_id)
 * Do not unify these systems; prefer the identity that has concrete fields.
 */
export const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const reduxToken = useAppSelector((state) => state.auth.token);
  const reduxIsAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated,
  );

  const token =
    reduxToken ||
    localStorage.getItem("codex_token") ||
    localStorage.getItem("token");
  const isAuthenticated = reduxIsAuthenticated || !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("codex_token", token);
    }
  }, [token]);

  useEffect(() => {
    if (reduxUser?.username || reduxUser?.teamName) {
      localStorage.setItem("user", JSON.stringify(reduxUser));
    }
  }, [reduxUser]);

  const login = async (identifier, password) => {
    const isEmail = identifier?.includes("@");

    try {
      if (isEmail) {
        // User/academy identity — backend expects emailId
        const response = await axiosClient.post("/user/login", {
          emailId: identifier,
          password,
        });
        const data = response?.data;
        if (data?.token && data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          localStorage.setItem("token", data.token);
          localStorage.setItem("codex_token", data.token);
          return { success: true, identity: "user" };
        }
        return {
          success: false,
          message: data?.message || "Login failed",
        };
      }

      // Team/collab identity
      const payload = {
        username: identifier,
        teamName: "DemoTeam",
        password,
      };
      const res = await dispatch(loginUser(payload));
      if (loginUser.fulfilled.match(res)) {
        localStorage.setItem("user", JSON.stringify(res.payload.user));
        return { success: true, identity: "team" };
      }
      return {
        success: false,
        message: res.payload || "Login failed",
      };
    } catch (error) {
      // Email path failed — optional team fallback only for non-email was already handled
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  const logout = async () => {
    try {
      await axiosClient.post("/user/logout").catch(() => {});
    } catch (err) {
      console.error("Logout API error:", err);
    }
    dispatch(reduxLogout());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("codex_token");
    localStorage.removeItem("codex_username");
    localStorage.removeItem("codex_team");
  };

  const user = useMemo(() => {
    const localUser = readLocalUser();
    const hasAcademyUser = !!(localUser?._id && localUser?.emailId);
    const hasTeamUser = !!(reduxUser?.username || reduxUser?.teamName);
    if (hasAcademyUser && !hasTeamUser) return localUser;
    if (hasTeamUser && !hasAcademyUser) return reduxUser;
    // If both present, prefer academy user for profile fields; team pages use Redux directly
    if (hasAcademyUser) return localUser;
    return reduxUser || localUser || {};
  }, [reduxUser]);

  return (
    <AuthContext.Provider
      value={{
        user: { ...user, token },
        token,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    const localUser = readLocalUser();
    return {
      user: localUser,
      token:
        localStorage.getItem("codex_token") || localStorage.getItem("token"),
      isAuthenticated: !!(
        localStorage.getItem("codex_token") || localStorage.getItem("token")
      ),
      login: async () => ({ success: false }),
      logout: async () => {},
    };
  }
  return context;
};
