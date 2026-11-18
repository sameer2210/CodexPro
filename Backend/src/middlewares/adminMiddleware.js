import jwt from "jsonwebtoken";
import redisWrapper from "../config/redis.js";
import User from "../models/user.js";
import config from "../config/config.js";

const adminMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.query?.token;
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    const payload = jwt.verify(token, config.JWT_SECRET);

    if (payload.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const { _id } = payload;
    if (!_id) {
      return res.status(401).json({ success: false, message: "Id is Missing" });
    }

    const result = await User.findById(_id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "User Doesn't Exist" });
    }

    const isBlocked = await redisWrapper.exists(`token:${token}`);
    if (isBlocked === null) {
      return res.status(503).json({
        success: false,
        message: "Authentication service temporarily unavailable",
      });
    }
    if (isBlocked) {
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.result = result;
    req.user = result;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Error Occurred: " + err.message });
  }
};

export default adminMiddleware;
