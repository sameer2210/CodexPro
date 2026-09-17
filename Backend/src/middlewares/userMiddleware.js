import jwt from 'jsonwebtoken';
import redisWrapper from '../config/redis.js';
import User from '../models/user.js';

export const userMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.query?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing',
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    const result = await User.findById(_id);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isBlocked = await redisWrapper.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Session expired',
      });
    }

    req.result = result;
    req.user = result;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again',
        error: err.message,
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: err.message,
    });
  }
};

export const optionalUserMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.query?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const { _id } = payload;
      if (_id) {
        const result = await User.findById(_id);
        if (result) {
          req.result = result;
          req.user = result;
        }
      }
    }
  } catch (err) {
    // Ignore error for optional middleware
  }
  next();
};

export const checkPremiumAndTokens = (req, res, next) => {
  try {
    const user = req.result || req.user;

    if (!user || !user.isPremium) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Premium subscription required.',
      });
    }

    if (user.tokensLeft <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient tokens. Please purchase more.',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Middleware check failed',
      error: err.message,
    });
  }
};

export default {
  userMiddleware,
  optionalUserMiddleware,
  checkPremiumAndTokens,
};
