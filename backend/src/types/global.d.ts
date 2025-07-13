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
  bot: boolean; // whether the user belongs to an OAuth2 application
  system: boolean; // whether the user is an Official Discord System user
  mfa_enabled: boolean; // whether the user has two factor enabled on their account
  banner: string; // the user's banner hash
  accent_color: number; // the user's banner color encoded as an integer representation of hexadecimal color code
  locale: string; // the user's chosen language option
  verified: string; // whether the email on this account has been verified
  email: string; // the user's email
  flags: number; // the flags on a user's account
  premium_type: number; // the type of Nitro subscription on a user's account
  public_flags: number; // the public flags on a user's account
};
