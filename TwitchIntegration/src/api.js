import express from 'express';
import bodyParser from 'body-parser';

export default function api(twitch) {
  const app = express();
  app.use(bodyParser.json());

  app.get('/recent_messages', (req, res) => {
    // TODO: Implement message cache
    res.json([]);
  });

  app.post('/send_whisper', (req, res) => {
    const { to, message } = req.body;
    twitch.sendWhisper(to, message)
      .then(() => res.json({ status: 'sent' }))
      .catch(err => res.status(500).json({ error: err.message }));
  });

  app.post('/mod_action/ban', (req, res) => {
    const { channel, username, reason } = req.body;
    twitch.banUser(channel, username, reason)
      .then(() => res.json({ status: 'banned', username }))
      .catch(err => res.status(500).json({ error: err.message }));
  });

  // Add more endpoints for mod actions, user mapping, etc.

  app.listen(process.env.TWITCH_API_PORT || 4001, () => {
    console.log('Twitch REST API listening');
  });
}
