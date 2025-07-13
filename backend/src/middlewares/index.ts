import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getSession, getUser } from "~/lib/utils";

export const SessionValidator = createMiddleware(async (c, next) => {
  const token = getCookie(c, "session");

  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const session = await getSession(token);
  if (!session) return c.json({ error: "Session expired or is invalid" }, 401);

  const user = await getUser(session.userId);
  if (!user) return c.json({ error: "User not found" }, 404);

  c.set("user", user);

  await next();
});
