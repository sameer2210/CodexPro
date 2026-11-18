import mongoose from "mongoose";
import config from "../config/config.js";

const connectToDb = async () => {
  try {
    if (process.env.SKIP_MONGODB === "true") {
      console.log(
        "Skipping MongoDB connection as per SKIP_MONGODB configuration",
      );
      return;
    }
    const mongoURI = config.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.warn(
      "MongoDB Connection Warning (server continuing without MongoDB):",
      error.message,
    );
  }
};

export default connectToDb;
