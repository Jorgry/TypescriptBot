import { serve } from "bun";
import { App } from "./lib/app";
import { cors } from "hono/cors";
import { logger } from "./lib/utils";

import auth from "./routes/auth";
import dashboard from "./routes/dashboard";

const app = await App();

app.basePath("/api");
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.route("/auth", auth);
app.route("/dashboard", dashboard);

const server = serve({
  fetch: app.fetch,
});

logger.info(`Server listenizng at ${server.url}`);
