import WebSocket from 'ws';
import http from 'http';
import express from 'express';

// Create HTTP server and WebSocket server
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  clients.add(ws);

  // Forward messages from WebSocket to all clients (broadcast)
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received message:', message);
      broadcast(message);
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });

  // Clean up on disconnect
  ws.on('close', () => {
    console.log('WebSocket disconnected');
    clients.delete(ws);
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Endpoint for Twitch/Discord to send messages to the WebSocket server
app.use(express.json());
app.post('/chat/message', (req, res) => {
  const { platform, username, content, timestamp = Date.now() } = req.body;
  if (!platform || !username || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const message = { platform, username, content, timestamp };
  broadcast(message);
  res.status(200).json({ status: 'sent' });
});

export { server, wss };

export default (port) => {
  server.listen(port, () => {
    console.log(`WebSocket server running on ws://localhost:${port}`);
  });
};
