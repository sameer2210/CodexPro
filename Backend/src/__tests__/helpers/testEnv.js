/**
 * Must run before importing app/config. Uses dedicated test DB only.
 * Never points at production credentials or production user data.
 */
export function applyAuthTestEnv() {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET =
    process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
      ? process.env.JWT_SECRET
      : "codex-auth-test-jwt-secret-32chars-min!!";
  process.env.GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID ||
    "test-google-client-id.apps.googleusercontent.com";
  process.env.FRONTEND_URLS =
    process.env.FRONTEND_URLS || "http://localhost:5173";
  // Clear redis so wrappers no-op unless tests mock redis open
  process.env.REDIS_STRING = "";
  process.env.REDIS_PORT_NO = "";
  process.env.REDIS_PASSWORD = "";
  // Memory server overrides this in integration setup; keep a non-prod default.
  process.env.MONGODB_URI =
    process.env.MONGODB_URI_TEST ||
    "mongodb://127.0.0.1:27017/codex-auth-test";
}
