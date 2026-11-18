import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../../config/config.js";

export class TokenService {
  constructor() {
    this.secret =
      config.JWT_SECRET || "CodeX_Default_Development_Secret_Key_2026";
    this.accessExpiresIn = "24h";
    this.refreshExpiresInDays = 30;
  }

  generateAccessToken(payload) {
    const claims = {
      _id: payload._id
        ? payload._id.toString()
        : payload.userId
          ? payload.userId.toString()
          : undefined,
      userId: payload._id
        ? payload._id.toString()
        : payload.userId
          ? payload.userId.toString()
          : undefined,
      emailId: payload.emailId || payload.email,
      email: payload.email || payload.emailId,
      username:
        payload.username ||
        (payload.emailId ? payload.emailId.split("@")[0] : "user"),
      role: payload.role || "user",
      teamName: payload.teamName || "personal",
      isAdmin: payload.isAdmin || payload.role === "admin",
    };

    return jwt.sign(claims, this.secret, { expiresIn: this.accessExpiresIn });
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      throw error;
    }
  }

  generateRefreshToken() {
    const rawToken = crypto.randomBytes(40).toString("hex");
    const hash = this.hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + this.refreshExpiresInDays * 24 * 60 * 60 * 1000,
    );
    return { rawToken, hash, expiresAt };
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  generateOtp() {
    return crypto.randomInt(100000, 1000000).toString();
  }
}

export default new TokenService();
