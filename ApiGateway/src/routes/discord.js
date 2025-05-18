import { Router } from 'express';
const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'discord' });
});
// Add more Discord endpoints here

export default router;
