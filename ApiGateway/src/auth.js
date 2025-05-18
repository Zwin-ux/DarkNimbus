import passport from 'passport';
import DiscordStrategy from 'passport-discord';
import TwitchStrategy from 'passport-twitch-new';

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'guilds', 'messages.read', 'messages.write']
}, (accessToken, refreshToken, profile, done) => {
  // TODO: Persist tokens securely, map to user
  return done(null, { profile, accessToken, refreshToken });
}));

passport.use(new TwitchStrategy({
  clientID: process.env.TWITCH_CLIENT_ID,
  clientSecret: process.env.TWITCH_CLIENT_SECRET,
  callbackURL: process.env.TWITCH_CALLBACK_URL,
  scope: 'user:read:email chat:edit chat:read moderator:manage:banned_users'
}, (accessToken, refreshToken, profile, done) => {
  // TODO: Persist tokens securely, map to user
  return done(null, { profile, accessToken, refreshToken });
}));
