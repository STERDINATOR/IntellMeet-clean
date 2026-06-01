import mongoose from "mongoose";
import { env } from "./config/env.js";

const defaultLocalUri = "mongodb://127.0.0.1:27017/intellmeet";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  const shouldFallback = env.mongoUri === "" || env.mongoUri === defaultLocalUri;

  if (env.mongoUri) {
    try {
      await mongoose.connect(env.mongoUri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
      return;
    } catch (error) {
      if (!shouldFallback) {
        throw error;
      }
      console.warn(
        `MongoDB connection failed for ${env.mongoUri}. Falling back to in-memory MongoDB.`,
        error,
      );
    }
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri(), {
    autoIndex: true,
  });
  console.log(`MongoDB in-memory started: ${mongoose.connection.name}`);
}
