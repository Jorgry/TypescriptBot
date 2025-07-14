import { redis } from "bun";
import type { PermissionResolvable } from "discord.js";
import { Hono } from "hono";
import { DISCORD_ENDPOINT } from "~/constants";
import { env } from "~/env";
import { hasPermissions, logger } from "~/lib/utils";
import { PremiumGuilds } from "~/models";

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

  const botGuildsRes = await fetch(`${DISCORD_ENDPOINT}/users/@me/guilds`, {
    method: "GET",
    headers: {
  Authorization: `Bot ${env.DISCORD_APPLICATION_TOKEN}`,
},
  });

  if (!botGuildsRes.ok) {
    const errorMsg = await botGuildsRes.text();
    logger.error(errorMsg);
    return c.json({ error: "Failed to fetch bot guilds" }, 500);
  }

  const botGuilds = (await botGuildsRes.json()) as DiscordGuildObject[];
  const botGuildIds = new Set(botGuilds.map((g) => g.id));

  const filteredGuilds = guildResJson.filter((guild) =>
    hasPermissions(guild.permissions, "ManageGuild")
  );

  const premiumGuilds = await PremiumGuilds.find({
    guildId: { $in: filteredGuilds.map((g) => g.id) },
  });

  const premiumIds = new Set(premiumGuilds.map((g) => g.guildId));

  const enrichedGuilds = filteredGuilds.map((guild) => ({
    ...guild,
    premium: premiumIds.has(guild.id),
    botInvited: botGuildIds.has(guild.id),
  }));

  await redis.set(
    `user-guilds:${user.id}`,
    JSON.stringify(enrichedGuilds),
    "EX",
    600
  );

  return c.json(enrichedGuilds, 200);
});

// for testing
type PlanType = "monthly" | "lifetime";
const validPlans = ["monthly", "lifetime"] as const;

app.get("/set-premium", async (c) => {
  const guildId = c.req.query("guildId");
  const plan = c.req.query("plan");
  const expiresAtRaw = c.req.query("expiration");

  if (!guildId || !plan || !validPlans.includes(plan as PlanType)) {
    return c.json({ error: "Invalid parameters" }, 400);
  }

  let expiresAt: Date | undefined;
  if (expiresAtRaw) {
    const parsedDate = new Date(expiresAtRaw);
    if (isNaN(parsedDate.getTime())) {
      return c.json({ error: "Invalid expiration date" }, 400);
    }
    expiresAt = parsedDate;
  }

  let guild = await PremiumGuilds.findOne({ guildId });

  if (!guild) {
    guild = new PremiumGuilds({
      guildId,
      plan: plan as PlanType,
      ...(expiresAt && { expiresAt }), // conditionally add if exists
    });
  } else {
    guild.plan = plan as PlanType;
    if (expiresAt) guild.expiresAt = expiresAt;
  }

  await guild.save();

  return c.json({ message: "Premium status updated", guild }, 200);
});

export default app;
