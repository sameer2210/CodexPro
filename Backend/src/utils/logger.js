import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "password",
    "token",
  ],

  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
