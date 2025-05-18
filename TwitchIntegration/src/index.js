import dotenv from 'dotenv';
dotenv.config();
import TwitchClient from './twitchClient.js';
import api from './api.js';
import wsServer from './ws.js';

const twitch = new TwitchClient({
  options: { debug: true },
  connection: { reconnect: true },
  identity: {
    username: process.env.TWITCH_BOT_USERNAME,
    password: process.env.TWITCH_OAUTH_TOKEN
  },
  channels: process.env.TWITCH_CHANNELS ? process.env.TWITCH_CHANNELS.split(',') : []
});

twitch.connect();

api(twitch); // start REST API
wsServer(twitch); // start WebSocket server

console.log('TwitchIntegration service running.');
