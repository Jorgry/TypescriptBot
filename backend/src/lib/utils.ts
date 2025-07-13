import pino from "pino";
import { Session, User } from "~/models";
import { PermissionsBitField, type PermissionResolvable } from "discord.js";

export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
    },
  },
});

export const hasPermissions = (
  permissions: PermissionResolvable,
  permission: PermissionResolvable
) => {
  const perms = new PermissionsBitField(permissions);
  return perms.has(permission);
};

export const createSession = async (userId: string) => {
  const session = await Session.findOne({ userId });

  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const expiresAt = new Date(now + oneDay);

  if (session) {
    // If session is still valid and has more than 15 minutes left, reuse it
    const timeLeft = session.expiresAt.getTime() - now;

    if (timeLeft > 1000 * 60 * 15) {
      return session.sessionToken;
    }

    // Otherwise, refresh it
    session.sessionToken = crypto.randomUUID();
    session.expiresAt = expiresAt;
    await session.save();

    return session.sessionToken;
  }

  // No session exists — create a new one
  const newToken = crypto.randomUUID();
  const newSession = new Session({
    userId,
    sessionToken: newToken,
    expiresAt,
  });

  await newSession.save();

  return newToken;
};

export const getSession = async (token: string) => {
  const session = await Session.findOne({ sessionToken: token });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await Session.deleteOne({ sessionToken: token });
    return null;
  }

  return session;
};

export const getUser = async (userId: string) => {
  const userDoc = await User.findOne({ id: userId });

  if (!userDoc) return null;

  const user = {
    id: userDoc.id,
    username: userDoc.username,
    avatarHash: userDoc.avatarHash,
    accessToken: userDoc.accessToken,
    refreshToken: userDoc.refreshToken,
  };

  return user;
};
