import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axiosClient from "../api/config";
import { clearAcademySession, getAcademyToken } from "../api/authTokens";

const AuthContext = createContext();

const readAcademyUser = () => {
  try {
    return JSON.parse(localStorage.getItem("academy_user") || "null");
  } catch {
    return null;
  }
};

const persistAcademySession = (user, token) => {
  localStorage.setItem("academy_token", token);
  localStorage.setItem("academy_user", JSON.stringify(user));
};

/**
 * Academy / individual-user authentication only.
 * Team collaboration auth remains in Redux authSlice + codex_token.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAcademyToken());
  const [user, setUser] = useState(() => readAcademyUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(getAcademyToken());
    setUser(readAcademyUser());
  }, []);

  const isAuthenticated = !!token;

  const login = useCallback(async (emailId, password) => {
    setIsLoading(true);
    try {
      const normalizedEmail = String(emailId || "")
        .trim()
        .toLowerCase();
      const response = await axiosClient.post("/user/login", {
        emailId: normalizedEmail,
        password,
      });
      const data = response?.data;
      if (data?.token && data?.user) {
        persistAcademySession(data.user, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, identity: "user", user: data.user };
      }
      return {
        success: false,
        message: data?.message || "Login failed",
      };
    } catch (error) {
      const data = error.response?.data;
      return {
        success: false,
        message: data?.message || error.message || "Login failed",
        needsVerification: !!data?.needsVerification,
        email: data?.email,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async ({ firstName, emailId, password, confirmPassword }) => {
      setIsLoading(true);
      try {
        const response = await axiosClient.post("/user/register", {
          firstName: String(firstName || "").trim(),
          emailId: String(emailId || "").trim().toLowerCase(),
          password,
          confirmPassword,
        });
        const data = response?.data;
        if (data?.token && data?.user) {
          persistAcademySession(data.user, data.token);
          setToken(data.token);
          setUser(data.user);
          return { success: true, user: data.user, needsVerification: true };
        }
        return {
          success: false,
          message: data?.message || "Registration failed",
        };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "Registration failed",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const loginWithGoogle = useCallback(async (credential) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/user/googleLogin", {
        credential,
      });
      const data = response?.data;
      if (data?.token && data?.user) {
        persistAcademySession(data.user, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      return {
        success: false,
        message: data?.message || "Google sign-in failed",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Google sign-in failed",
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosClient.post("/user/logout").catch(() => {});
    } catch {
      /* ignore */
    }
    clearAcademySession();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user: user ? { ...user, token } : null,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
      identity: "academy",
    }),
    [
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      loginWithGoogle,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: readAcademyUser(),
      token: getAcademyToken(),
      isAuthenticated: !!getAcademyToken(),
      isLoading: false,
      login: async () => ({ success: false }),
      register: async () => ({ success: false }),
      loginWithGoogle: async () => ({ success: false }),
      logout: async () => {},
      identity: "academy",
    };
  }
  return context;
};
