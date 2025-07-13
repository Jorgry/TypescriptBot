import { Hono } from "hono";
import { SessionValidator } from "~/middlewares";
import userRoute from "./@me";

const app = new Hono();

app.use("/*", SessionValidator);
app.route("/@me", userRoute);

export default app;
