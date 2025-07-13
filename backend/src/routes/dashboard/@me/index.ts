import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  const user = c.get("user");
  if (user) {
    const { accessToken, refreshToken, ...userInfo } = user;

    return c.json(userInfo, 200);
  } else {
    return c.json({ error: "unauthorized" }, 401)
  }
});

export default app;
