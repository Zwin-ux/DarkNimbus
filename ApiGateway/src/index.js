import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import passport from 'passport';
import cors from 'cors';
import './auth.js';
import discordRoutes from './routes/discord.js';
import twitchRoutes from './routes/twitch.js';
import unifiedRoutes from './routes/unified.js';

const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

app.use('/discord', discordRoutes);
app.use('/twitch', twitchRoutes);
app.use('/unified', unifiedRoutes);

const server = createServer(app);

// Create WebSocket server with CORS support
const wss = new WebSocketServer({ 
  server,
  verifyClient: (info, done) => {
    // Add CORS verification if needed
    done(true);
  }
});

// Store connected clients
const chatClients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection for chat');
  chatClients.add(ws);

  // Forward messages from WebSocket to all clients (broadcast)
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received chat message:', message);
      broadcastChatMessage(message);
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });

  // Clean up on disconnect
  ws.on('close', () => {
    console.log('Chat WebSocket disconnected');
    chatClients.delete(ws);
  });
});

// Broadcast chat message to all connected clients
function broadcastChatMessage(message) {
  const data = JSON.stringify(message);
  chatClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Endpoint for Twitch/Discord to send messages to the WebSocket server
app.post('/chat/message', (req, res) => {
  const { platform, username, content, timestamp = Date.now() } = req.body;
  if (!platform || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const message = { platform, username, content, timestamp };
  broadcastChatMessage(message);
  res.status(200).json({ status: 'sent' });
});

wss.on('connection', ws => {
  // TODO: Authenticate, subscribe to events
  ws.send(JSON.stringify({ type: 'hello', msg: 'Connected to API Gateway WS' }));
});

const PORT = process.env.API_GATEWAY_PORT || 5000;
server.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
