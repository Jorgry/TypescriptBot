import { env } from "~/env"

const encodedURI = encodeURIComponent(
    "http://localhost:3000/api/auth/callback"
)

export const DASHBOARD_URL = "http://localhost:5173"
export const REDIRECT_URL = `https://discord.com/oauth2/authorize?client_id=${env.DISCORD_APPLICATION_ID}&response_type=code&redirect_uri=${encodedURI}&scope=guilds+identify`
export const DISCORD_ENDPOINT = "https://discord.com/api/v10"
export const DISCORD_APPLICATION_ID = env.DISCORD_APPLICATION_ID
export const DISCORD_APPLCAITION_SECRET = env.DISCORD_APPLICATION_SECRET
export const REDIRECT_URI = env.DISCORD_REDIRECT_URI