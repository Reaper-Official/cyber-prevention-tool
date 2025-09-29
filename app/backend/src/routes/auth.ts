import { Router } from 'express';
import { body } from 'express-validator';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  login
);

router.post(
  '/register',
  authenticate,
  authorize('ADMIN'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('name').notEmpty(),
    body('role').isIn(['ADMIN', 'HR', 'REVIEWER', 'EMPLOYEE']),
  ],
  register
);

router.get('/me', authenticate, getMe);

export default router;