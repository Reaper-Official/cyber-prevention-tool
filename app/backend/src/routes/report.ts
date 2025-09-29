import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { exportCampaignReport } from '../controllers/reportController.js';

const router = Router();

router.get('/campaign/:id/export', authenticate, exportCampaignReport);

export default router;