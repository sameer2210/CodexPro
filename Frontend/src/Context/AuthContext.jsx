import React, { createContext, useContext, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, logout as reduxLogout } from "../store/slices/authSlice";
import axiosClient from "../utils/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const reduxToken = useAppSelector((state) => state.auth.token);
  const reduxIsAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const token =
    reduxToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("codex_token");
  const isAuthenticated = reduxIsAuthenticated || !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("codex_token", token);
    }
    if (reduxUser) {
      localStorage.setItem("user", JSON.stringify(reduxUser));
    }
  }, [token, reduxUser]);

  const login = async (identifier, password) => {
    const payload = identifier?.includes("@")
      ? { email: identifier, password }
      : { username: identifier, teamName: "DemoTeam", password };

    try {
      const response = await axiosClient.post("/user/login", payload).catch(async () => {
        const res = await dispatch(loginUser(payload));
        if (loginUser.fulfilled.match(res)) {
          return { data: { success: true, user: res.payload.user, token: res.payload.token } };
        }
        throw new Error(res.payload || "Login failed");
      });

      if (response?.data?.success) {
        const { user, token } = response.data;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        localStorage.setItem("codex_token", token);
        return { success: true };
      }
      return { success: false, message: response?.data?.message || "Login failed" };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
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

  const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

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
    return {
      user: JSON.parse(localStorage.getItem("user") || "{}"),
      token: localStorage.getItem("token") || localStorage.getItem("codex_token"),
      isAuthenticated: !!(localStorage.getItem("token") || localStorage.getItem("codex_token")),
      login: async () => {},
      logout: async () => {},
    };
  }
  return context;
};
