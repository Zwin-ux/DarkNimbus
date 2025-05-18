import { Router } from 'express';
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'unified' });
});
// Unified ban endpoint (proxies to TwitchIntegration, can be extended for Discord)
import fetch from 'node-fetch';

router.post('/mod_action/ban', async (req, res) => {
  const { platform, channel, username, reason } = req.body;
  try {
    if (platform === 'twitch') {
      // Proxy to TwitchIntegration REST API
      const resp = await fetch('http://localhost:4001/mod_action/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, username, reason })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Twitch ban failed');
      return res.json({ status: 'banned', platform: 'twitch', username, channel });
    }
    if (platform === 'discord') {
      // Proxy to DiscordSocialSDKWrapper REST API
      const resp = await fetch('http://localhost:8080/kick_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: username, reason })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Discord kick failed');
      return res.json({ status: 'kicked', platform: 'discord', user_id: username });
    }
    return res.status(400).json({ error: 'Platform not supported yet' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Unified timeout endpoint
router.post('/mod_action/timeout', async (req, res) => {
  const { platform, user_id, duration, reason } = req.body;
  try {
    if (platform === 'discord') {
      const resp = await fetch('http://localhost:8080/timeout_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, duration, reason })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Discord timeout failed');
      return res.json({ status: 'timed_out', platform: 'discord', user_id, duration });
    }
    return res.status(400).json({ error: 'Platform not supported yet' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Unified role assignment endpoint
router.post('/mod_action/role', async (req, res) => {
  const { platform, user_id, role } = req.body;
  try {
    if (platform === 'discord') {
      const resp = await fetch('http://localhost:8080/assign_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, role })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Discord role assignment failed');
      return res.json({ status: 'role_assigned', platform: 'discord', user_id, role });
    }
    return res.status(400).json({ error: 'Platform not supported yet' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Add endpoints for unified mod/chat actions here

export default router;
