import { WebSocketServer } from 'ws';
import fetch from 'node-fetch';

// Forward chat messages to the API Gateway's WebSocket server
async function forwardToApiGateway(message) {
  try {
    const apiUrl = process.env.API_GATEWAY_URL || 'http://localhost:5000';
    await fetch(`${apiUrl}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: 'twitch',
        username: message.userstate['display-name'] || message.userstate.username,
        content: message.message,
        timestamp: Date.now(),
        channel: message.channel,
        userstate: message.userstate
      })
    });
  } catch (err) {
    console.error('Error forwarding message to API Gateway:', err);
  }
}

export default function wsServer(twitch) {
  // Local WebSocket server for direct connections (if needed)
  const wss = new WebSocketServer({ port: process.env.TWITCH_WS_PORT || 4002 });
  
  // Forward Twitch chat messages to API Gateway
  const chatHandler = (channel, userstate, message, self) => {
    if (self) return; // Ignore messages from the bot itself
    forwardToApiGateway({ channel, userstate, message });
  };

  // Forward Twitch whispers to API Gateway
  const whisperHandler = (from, userstate, message, self) => {
    if (self) return;
    forwardToApiGateway({
      channel: 'whisper',
      userstate: { ...userstate, username: from },
      message
    });
  };

  // Forward Twitch bans to API Gateway
  const banHandler = (channel, username, reason) => {
    forwardToApiGateway({
      type: 'ban',
      channel,
      username,
      reason,
      timestamp: Date.now()
    });
  };

  // Set up Twitch event listeners
  twitch.on('chat', chatHandler);
  twitch.on('whisper', whisperHandler);
  twitch.on('ban', banHandler);

  // Local WebSocket server (for backward compatibility)
  wss.on('connection', ws => {
    const localChatHandler = data => ws.send(JSON.stringify({ type: 'chat', ...data }));
    const localWhisperHandler = data => ws.send(JSON.stringify({ type: 'whisper', ...data }));
    const localBanHandler = data => ws.send(JSON.stringify({ type: 'ban', ...data }));

    twitch.on('chat', localChatHandler);
    twitch.on('whisper', localWhisperHandler);
    twitch.on('ban', localBanHandler);

    ws.on('close', () => {
      twitch.off('chat', localChatHandler);
      twitch.off('whisper', localWhisperHandler);
      twitch.off('ban', localBanHandler);
    });
  });

  console.log('Twitch WebSocket server running');
}
