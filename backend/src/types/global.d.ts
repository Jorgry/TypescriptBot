type DiscordOAuthTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: string;
};

type DiscordUserObjectResponse = {
  id: string; // the user's id
  username: string; // the user's username, not unique across the platform
  discriminator: string; // the user's Discord-tag
  global_name: string; // the user's display name, if it is set
  avatar: string; // the user's avatar hash
};

type DiscordGuildObject= {
  id: string; // guild id
  name: string; // guild name
  icon: string, // icon hash
  banner: string; // banner hash
  permissions: string;
}
