import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);

export default router;