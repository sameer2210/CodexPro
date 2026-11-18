import mongoose from "mongoose";
import config from "../config/config.js";

let isConnected = false;
let connectionPromise = null;

const connectionOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000,
  autoIndex: false, // Don't auto-build indexes in production startup to prevent lock stalls
};

export async function connectToDatabase(customUri = null) {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  if (process.env.SKIP_MONGODB === "true" && process.env.NODE_ENV !== "test") {
    console.log(
      "[Database] SKIP_MONGODB is true; continuing in offline/mock mode.",
    );
    return null;
  }

  const uri =
    customUri ||
    process.env.MONGODB_URI ||
    config.MONGODB_URI ||
    "mongodb://localhost:27017/codex";

  connectionPromise = mongoose
    .connect(uri, connectionOptions)
    .then((conn) => {
      isConnected = true;
      connectionPromise = null;
      console.log(
        `[Database] MongoDB connected successfully to ${conn.connection.name} (${conn.connection.host})`,
      );
      return conn.connection;
    })
    .catch((error) => {
      isConnected = false;
      connectionPromise = null;
      console.warn(`[Database] MongoDB Connection Warning: ${error.message}`);
      if (process.env.NODE_ENV === "test") {
        throw error;
      }
      return null;
    });

  return connectionPromise;
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    connectionPromise = null;
    console.log("[Database] MongoDB connection closed");
  }
}

export function getDatabaseHealth() {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  const readyState = mongoose.connection.readyState;
  return {
    status: readyState === 1 ? "healthy" : "unhealthy",
    readyState: states[readyState] || "unknown",
    host: mongoose.connection.host || null,
    databaseName: mongoose.connection.name || null,
    modelsLoaded: Object.keys(mongoose.models).length,
  };
}

export default connectToDatabase;
