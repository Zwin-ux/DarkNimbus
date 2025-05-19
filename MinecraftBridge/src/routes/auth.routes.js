// src/routes/auth.routes.js
import express from 'express';
import axios from 'axios';
import { logger } from '../utils/logger.js';
import { generateToken } from '../utils/jwt.js';
import { DiscordService } from '../services/discord.service.js'; // For user info fetching

const router = express.Router();

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const CLIENT_URL = process.env.CLIENT_URL; // Your frontend URL

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI || !CLIENT_URL) {
  logger.error(
    'FATAL ERROR: Discord OAuth2 environment variables (DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI, CLIENT_URL) are not fully defined.'
  );
  // Depending on your app's needs, you might want to prevent startup if these are missing.
}

// Route to initiate Discord OAuth2 flow
// GET /api/auth/discord
router.get('/discord', (req, res) => {
  if (!DISCORD_CLIENT_ID || !DISCORD_REDIRECT_URI) {
    return res.status(500).json({ error: 'Discord OAuth2 not configured correctly on server.' });
  }
  const discordOAuthURL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    DISCORD_REDIRECT_URI
  )}&response_type=code&scope=${encodeURIComponent('identify email guilds')}`; // Add more scopes as needed
  
  logger.info(`Redirecting to Discord OAuth: ${discordOAuthURL}`);
  res.redirect(discordOAuthURL);
});

// Route for Discord OAuth2 callback
// GET /api/auth/discord/callback
router.get('/discord/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    logger.warn('Discord OAuth2 callback missing authorization code.');
    return res.status(400).redirect(`${CLIENT_URL}/auth/error?message=AuthorizationCodeMissing`);
  }

  if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
    logger.error('Discord OAuth2 not configured correctly on server for callback.');
    return res.status(500).redirect(`${CLIENT_URL}/auth/error?message=ServerConfigurationError`);
  }
  
  try {
    // 1. Exchange authorization code for an access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token: discordAccessToken, token_type: discordTokenType } = tokenResponse.data;
    logger.info('Successfully exchanged code for Discord access token.');

    // 2. Fetch user information from Discord using the access token
    // We can use a simplified version here or a method from DiscordService if it exists
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        authorization: `${discordTokenType} ${discordAccessToken}`,
      },
    });

    const discordUser = userResponse.data; // Contains id, username, avatar, discriminator, email etc.
    logger.info(`Fetched Discord user info: ${discordUser.username}#${discordUser.discriminator} (ID: ${discordUser.id})`);

    // 3. (Optional) Store/update user information in your database
    // E.g., userService.findOrCreateUser({ discordId: discordUser.id, username: discordUser.username, ... });

    // 4. Generate a JWT for your application
    const appTokenPayload = {
      userId: discordUser.id, // Discord User ID
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      // Add any other relevant info from discordUser or your DB user record
    };
    const appToken = generateToken(appTokenPayload);
    logger.info(`Generated app JWT for Discord user ${discordUser.id}`);

    // 5. Redirect user back to your frontend with the appToken
    // The frontend should store this token (e.g., in localStorage) and use it for WebSocket authentication
    res.redirect(`${CLIENT_URL}/auth/success?token=${appToken}`);

  } catch (error) {
    logger.error('Error during Discord OAuth2 callback processing:');
    if (error.response) {
      logger.error(`Data: ${JSON.stringify(error.response.data)}`);
      logger.error(`Status: ${error.response.status}`);
      logger.error(`Headers: ${JSON.stringify(error.response.headers)}`);
    } else if (error.request) {
      logger.error(`Request: ${error.request}`);
    } else {
      logger.error(`Message: ${error.message}`);
    }
    res.status(500).redirect(`${CLIENT_URL}/auth/error?message=OAuthCallbackFailed`);
  }
});

export default router;
