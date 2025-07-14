import { createContext, useEffect, useState, type ReactNode } from "react";
import { axios } from "~/lib/utils";

type ContextTypes = {
  user: DiscordUser | null;
  guilds: DiscordGuild[] | null;
  loading: boolean;
};

export const AuthContext = createContext<ContextTypes | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuild[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndGuilds = async () => {
      try {
        const userData = await axios.get<DiscordUser>("/api/dashboard/@me");
        const guildData = await axios.get<DiscordGuild[]>(
          "/api/dashboard/@me/guilds"
        );

        setUser(userData.data);
        setGuilds(guildData.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGuilds();
  }, []);

  return (
    <AuthContext.Provider value={{ user, guilds, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
