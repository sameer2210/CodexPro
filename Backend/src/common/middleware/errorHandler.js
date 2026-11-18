import { AppError } from "../errors/AppError.js";
import logger from "../../utils/logger.js";

export function errorHandler(err, req, res, next) {
  let error = err;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = new AppError(
      `Resource not found with id of ${err.value}`,
      404,
      "INVALID_RESOURCE_ID",
    );
  }

  // Mongoose duplicate key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    error = new AppError(
      `Duplicate value entered for ${field}: "${value}". Please use another value.`,
      409,
      "DUPLICATE_KEY_ERROR",
      { field, value },
    );
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new AppError(
      "Validation failed on input data",
      400,
      "VALIDATION_ERROR",
      details,
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid authentication token", 401, "INVALID_TOKEN");
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError(
      "Authentication token has expired. Please log in again",
      401,
      "TOKEN_EXPIRED",
    );
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const code = error.code || "INTERNAL_ERROR";

  if (statusCode >= 500) {
    logger.error(
      { err, path: req.originalUrl, method: req.method },
      "Unhandled Exception",
    );
  } else {
    logger.warn(
      { statusCode, code, message, path: req.originalUrl },
      "Handled Client Error",
    );
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

export default errorHandler;
