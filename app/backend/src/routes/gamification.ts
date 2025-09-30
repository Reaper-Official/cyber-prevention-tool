import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getLeaderboard, getUserProfile, getBadges } from '../controllers/gamificationController.js';

const router = Router();

router.get('/leaderboard', authenticate, getLeaderboard);
router.get('/profile/:userId', authenticate, getUserProfile);
router.get('/badges', authenticate, getBadges);

export default router;