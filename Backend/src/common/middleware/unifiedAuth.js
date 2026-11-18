import jwt from "jsonwebtoken";
import config from "../../config/config.js";
import User from "../../modules/identity/models/user.model.js";
import sessionStore from "../utils/sessionStore.js";
import { AuthenticationError, AuthorizationError } from "../errors/AppError.js";

export const unifiedAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.query?.token;
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
        code: "UNAUTHENTICATED",
      });
    }

    // Check token revocation
    const isRevoked = await sessionStore.isTokenRevoked(token);
    if (isRevoked) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked or expired. Please login again.",
        code: "TOKEN_REVOKED",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: "Token expired, please login again",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        code: "INVALID_TOKEN",
      });
    }

    let user = null;

    // Token has user _id
    const userId = payload._id || payload.userId;
    if (userId) {
      user = await User.findById(userId);
    } else if (payload.username) {
      // Legacy token with username
      user = await User.findOne({ username: payload.username.toLowerCase() });
      if (!user && payload.teamName) {
        // Fallback search
        user = await User.findOne({
          emailId: `${payload.username.toLowerCase()}@codex.internal`,
        });
      }
    }

    if (!user) {
      // If user document not yet found but legacy token has teamName & username, construct virtual user
      if (payload.teamName && payload.username) {
        req.user = {
          _id: payload.memberId || payload._id,
          username: payload.username,
          teamName: payload.teamName,
          isAdmin: !!payload.isAdmin,
          role: payload.isAdmin ? "admin" : "user",
        };
        req.result = req.user;
        return next();
      }

      return res.status(404).json({
        success: false,
        message: "User account not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.status && user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact support.`,
        code: "ACCOUNT_INACTIVE",
      });
    }

    // Inject user into req.user and req.result for 100% backward compatibility
    req.user = user;
    req.result = user;

    // Attach convenience properties for team-aware routes
    if (!req.user.teamName) {
      req.user.teamName = payload.teamName || "personal";
    }
    if (!req.user.username && user.username) {
      req.user.username = user.username;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalUnifiedAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.query?.token;
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.slice(7).trim();
    }

    if (token) {
      try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        const userId = payload._id || payload.userId;
        if (userId) {
          const user = await User.findById(userId);
          if (user) {
            req.user = user;
            req.result = user;
          }
        }
      } catch (e) {
        // Ignore token error for optional auth
      }
    }
    next();
  } catch (err) {
    next();
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    const userRole =
      req.user?.role ||
      req.result?.role ||
      (req.user?.isAdmin ? "admin" : "user");
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden: requires one of [${roles.join(", ")}] role`,
        code: "FORBIDDEN",
      });
    }
    next();
  };
};

export const requireAdmin = requireRole("admin");

export default {
  unifiedAuth,
  optionalUnifiedAuth,
  requireRole,
  requireAdmin,
};
