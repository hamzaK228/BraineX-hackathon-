import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/me', authenticate, getCurrentUser);

export default router;
