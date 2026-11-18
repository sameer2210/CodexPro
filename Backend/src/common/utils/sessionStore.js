import UserSession from "../../modules/identity/models/userSession.model.js";
import redisWrapper from "../../config/redis.js";
import tokenService from "./tokenService.js";

export class SessionStore {
  async createSession(userId, rawRefreshToken, expiresAt, req = null) {
    const refreshTokenHash = tokenService.hashToken(rawRefreshToken);
    const userAgent = req?.headers ? req.headers["user-agent"] || "" : "";
    const ipAddress =
      req?.ip || req?.headers?.["x-forwarded-for"]?.split(",")[0]?.trim() || "";

    const session = await UserSession.create({
      userId,
      refreshTokenHash,
      userAgent,
      ipAddress,
      expiresAt,
      isValid: true,
    });

    try {
      await redisWrapper.set(`session:${session._id}`, "valid");
    } catch (e) {
      // Redis optional cache
    }

    return session;
  }

  async validateAndRotateSession(
    rawRefreshToken,
    newRawRefreshToken,
    newExpiresAt,
    req = null,
  ) {
    const oldHash = tokenService.hashToken(rawRefreshToken);
    const session = await UserSession.findOne({
      refreshTokenHash: oldHash,
      isValid: true,
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    // Invalidate old session or rotate hash
    const newHash = tokenService.hashToken(newRawRefreshToken);
    session.refreshTokenHash = newHash;
    session.expiresAt = newExpiresAt;
    session.lastUsedAt = new Date();
    if (req?.headers) {
      session.userAgent = req.headers["user-agent"] || session.userAgent;
      session.ipAddress = req.ip || session.ipAddress;
    }
    await session.save();

    return session;
  }

  async revokeSession(sessionId) {
    await UserSession.findByIdAndUpdate(sessionId, { isValid: false });
    try {
      await redisWrapper.del(`session:${sessionId}`);
    } catch (e) {}
  }

  async revokeAllUserSessions(userId) {
    await UserSession.updateMany({ userId }, { isValid: false });
  }

  async isTokenRevoked(token) {
    try {
      const isBlocked = await redisWrapper.exists(`token:${token}`);
      if (isBlocked === 1 || isBlocked === true) {
        return true;
      }
    } catch (e) {
      // Redis offline, fallback to false
    }
    return false;
  }

  async blockToken(token, expiresInSeconds = 86400) {
    try {
      await redisWrapper.set(`token:${token}`, "blocked");
      await redisWrapper.expire(`token:${token}`, expiresInSeconds);
    } catch (e) {}
  }
}

export default new SessionStore();
