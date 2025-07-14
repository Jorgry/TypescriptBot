type DiscordUser = {
  id: string;
  username: string;
  discriminator: string;
  global_name: string;
  avatar: string;
};

type DiscordGuild = {
  id: string;
  name: string;
  icon: string;
  banner: string;
  premium: boolean;
};
