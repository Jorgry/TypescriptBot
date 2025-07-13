import { Hono } from "hono";
import { logger } from "./utils";
import mongoose from "mongoose";
import { env } from "~/env";

const app = new Hono().basePath("/api");

export async function App() {
  try {
    logger.info("Attempting to connect to the MonogDB Database");
    await mongoose.connect(env.DATABASE_URL);
    logger.info("Successfully connected to the MongoDB Database");
  } catch (error) {
    logger.error(error);
  }

  return app;
}
