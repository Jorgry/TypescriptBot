import { redis } from "bun";
import type { PermissionResolvable } from "discord.js";
import { Hono } from "hono";
import { DISCORD_ENDPOINT } from "~/constants";
import { hasPermissions } from "~/lib/utils";

const app = new Hono();

app.get("/", async (c) => {
  const user = c.get("user");
  if (user) {
    const { accessToken, refreshToken, ...userInfo } = user;

    return c.json(userInfo, 200);
  } else {
    return c.json({ error: "unauthorized" }, 401);
  }
});

app.get("/guilds", async (c) => {
  const user = c.get("user");
  const skipCache = c.req.query("skipcache");

  if (!skipCache) {
    const redisCacheRes = await redis.get(`user-guilds:${user.id}`);

    if (redisCacheRes) return c.json(JSON.parse(redisCacheRes), 200);
  }

  const guildRes = await fetch(`${DISCORD_ENDPOINT}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });

  if (!guildRes.ok) {
    return c.json({ error: "Failed to fetch guilds" }, 500);
  }

  const guildResJson = (await guildRes.json()) as DiscordGuildObject[];

  const guilds = guildResJson.filter((guild) =>
    hasPermissions(guild.permissions, "ManageGuild")
  );

  await redis.set(`user-guilds:${user.id}`, JSON.stringify(guilds), "EX", 600);

  return c.json(guilds, 200);
});

export default app;
