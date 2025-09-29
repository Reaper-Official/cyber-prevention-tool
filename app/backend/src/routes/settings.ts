import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();

router.get('/', authenticate, getSettings);
router.put('/', authenticate, authorize('ADMIN'), updateSettings);

export default router;