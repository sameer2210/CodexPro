import { config } from 'dotenv';
config();

const parseOrigins = value =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.replace(/\/+$/, ''));

const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL;

const _config = {
  FRONTEND_URLS: envOrigins ? parseOrigins(envOrigins) : ['http://localhost:5173'],

  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/codex',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_1 || '',
  GEMINI_API_KEYS: process.env.GEMINI_API_KEYS || '',
  TURN_URLS: process.env.TURN_URLS || '',
  TURN_USERNAME: process.env.TURN_USERNAME || '',
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL || '',
  STUN_URLS: process.env.STUN_URLS || 'stun:stun.l.google.com:19302',
  REDIS_STRING: process.env.REDIS_STRING || '',
  REDIS_PORT_NO: process.env.REDIS_PORT_NO || '',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
  RAZORPAY_KEY: process.env.RAZORPAY_KEY || '',
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
};

export default Object.freeze(_config);
