import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import passport from 'passport';
import './auth.js';
import discordRoutes from './routes/discord.js';
import twitchRoutes from './routes/twitch.js';
import unifiedRoutes from './routes/unified.js';

const app = express();
app.use(express.json());
app.use(passport.initialize());

app.use('/discord', discordRoutes);
app.use('/twitch', twitchRoutes);
app.use('/unified', unifiedRoutes);

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  // TODO: Authenticate, subscribe to events
  ws.send(JSON.stringify({ type: 'hello', msg: 'Connected to API Gateway WS' }));
});

const PORT = process.env.API_GATEWAY_PORT || 5000;
server.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
