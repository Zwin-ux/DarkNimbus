import { Router } from 'express';
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'twitch' });
});
// Add more Twitch endpoints here

export default router;
