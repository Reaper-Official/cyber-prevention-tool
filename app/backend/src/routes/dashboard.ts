import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

router.get('/stats', authenticate, getDashboardStats);

export default router;