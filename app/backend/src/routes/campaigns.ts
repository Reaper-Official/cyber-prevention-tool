import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  getCampaignStats,
  validateCampaign,
  publishCampaign,
} from '../controllers/campaignController.js';

const router = Router();

router.post('/', authenticate, authorize('ADMIN', 'HR'), createCampaign);
router.get('/', authenticate, getCampaigns);
router.get('/:id', authenticate, getCampaignById);
router.get('/:id/stats', authenticate, getCampaignStats);
router.post('/:id/validate', authenticate, authorize('ADMIN', 'REVIEWER'), validateCampaign);
router.post('/:id/publish', authenticate, authorize('ADMIN', 'HR'), publishCampaign);

export default router;