// backend/routes/ai.js
import express from 'express';
import { chat, clearHistory, getHistory } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

// AI-specific rate limit: 30 messages per hour per user
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  keyGenerator: (req) => `ai_${req.user?.id || req.ip}`,
  message: { success: false, error: 'Too many AI requests. Limit: 30 per hour.' }
});

const router = express.Router();

router.post('/chat', authenticate, aiLimiter, chat);
router.get('/history', authenticate, getHistory);
router.delete('/history', authenticate, clearHistory);

export default router;
