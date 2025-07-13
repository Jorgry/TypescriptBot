import { serve } from "bun";
import { App } from "./lib/app";
import { cors } from "hono/cors";
import { logger } from "./lib/utils";

const app = await App();

app.basePath("/api");
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.get("/", (c) => {
  return c.text("Hello world");
});

const server = serve({
  fetch: app.fetch,
});

logger.info(`Server listening at ${server.url}`);
