import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { DISCORD_APPLCAITION_SECRET } from "./constants";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    DISCORD_APPLICATION_ID: z.string(),
    DISCORD_APPLICATION_TOKEN: z.string(),
    DISCORD_APPLICATION_SECRET: z.string(),
    DISCORD_REDIRECT_URI: z.string(),
  },

  runtimeEnv: process.env,
});
