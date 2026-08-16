import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    success: true, 
    status: 'UP', 
    service: 'SentixAI Backend',
    timestamp: new Date().toISOString()
  });
});

export default router;
