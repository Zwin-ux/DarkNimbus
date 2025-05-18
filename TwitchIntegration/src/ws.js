import { WebSocketServer } from 'ws';

export default function wsServer(twitch) {
  const wss = new WebSocketServer({ port: process.env.TWITCH_WS_PORT || 4002 });
  wss.on('connection', ws => {
    const chatHandler = data => ws.send(JSON.stringify({ type: 'chat', ...data }));
    const whisperHandler = data => ws.send(JSON.stringify({ type: 'whisper', ...data }));
    twitch.on('chat', chatHandler);
    twitch.on('whisper', whisperHandler);
    const banHandler = data => ws.send(JSON.stringify({ type: 'ban', ...data }));
    twitch.on('ban', banHandler);

    ws.on('close', () => {
      twitch.off('chat', chatHandler);
      twitch.off('whisper', whisperHandler);
      twitch.off('ban', banHandler);
    });
  });
  console.log('Twitch WebSocket server running');
}
