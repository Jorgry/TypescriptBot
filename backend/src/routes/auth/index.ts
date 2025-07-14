import { Hono } from "hono";
import {
  DISCORD_APPLCAITION_SECRET,
  DISCORD_APPLICATION_ID,
  DISCORD_ENDPOINT,
  REDIRECT_URI,
  REDIRECT_URL,
} from "~/constants";
import { createSession, logger } from "~/lib/utils";
import { User } from "~/models";
import { deleteCookie, setCookie } from "hono/cookie";

/*
 * [GET] http://localhost:3000/api/auth/signin
 * [GET] http://localhost:3000/api/auth/callback
 * [GET] http://localhost:3000/api/auth/signout
 */

const app = new Hono();

app.get("/signin", (c) => {
  return c.redirect(REDIRECT_URL, 307);
});

app.get("/callback", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.json(
      { error: "The 'code' parameter must be present in the URL." },
      400
    );
  }

  const oauthRes = await fetch(`${DISCORD_ENDPOINT}/oauth2/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: DISCORD_APPLICATION_ID,
      client_secret: DISCORD_APPLCAITION_SECRET,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
      code,
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (!oauthRes.ok) {
    logger.error(await oauthRes.text());
    return c.json({ error: "Failed to exchange code for token" }, 500);
  }

  const oauthResJson = (await oauthRes.json()) as DiscordOAuthTokenResponse;

  const userRes = await fetch(`${DISCORD_ENDPOINT}/users/@me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${oauthResJson.access_token}`,
    },
  });

  if (!userRes.ok) {
    logger.error(await userRes.text());
    return c.json({ error: "Failed to fetch user info" }, 500);
  }

  const userResJson = (await userRes.json()) as DiscordUserObjectResponse;

  let user = await User.findOne({ id: userResJson.id });

  if (!user) {
    user = new User({
      id: userResJson.id,
      username: userResJson.username,
      discrimator: userResJson.discriminator,
      global_name: userResJson.global_name,
      avatarHash: userResJson.avatar,
      accessToken: oauthResJson.access_token,
      refreshToken: oauthResJson.refresh_token,
    });
  } else {
    user.username = userResJson.username;
    user.discrimator = userResJson.discriminator;
    user.global_name = userResJson.global_name;
    user.avatarHash = userResJson.avatar;
    user.accessToken = oauthResJson.access_token;
    user.refreshToken = oauthResJson.refresh_token;
  }

  await user.save();

  const token = await createSession(userResJson.id);

  // Set the session token in a cookie
  setCookie(c, "session", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });

  // Redirect to dashboard or home
  return c.redirect("/api", 302);
});

app.get("/signout", (c) => {
  deleteCookie(c, "session");

  return c.redirect("/api", 302); // Or redirect to your login/dashboard
});

export default app;
