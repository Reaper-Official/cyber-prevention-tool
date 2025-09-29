import { Router } from 'express';
import { trackingLimiter } from '../middleware/rateLimiter.js';
import { trackOpen, trackClick, trackReading } from '../controllers/trackingController.js';

const router = Router();

router.post('/open', trackingLimiter, trackOpen);
router.post('/click', trackingLimiter, trackClick);
router.post('/reading', trackingLimiter, trackReading);

export default router;