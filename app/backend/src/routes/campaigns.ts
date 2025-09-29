import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  validateCampaign,
  publishCampaign,
} from '../controllers/campaignController.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('name').notEmpty(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
    body('targets').isArray(),
    body('sandboxMode').isBoolean(),
  ],
  createCampaign
);

router.get('/', authenticate, getCampaigns);
router.get('/:id', authenticate, getCampaignById);
router.post('/:id/validate', authenticate, authorize('ADMIN', 'REVIEWER'), validateCampaign);
router.post('/:id/publish', authenticate, authorize('ADMIN'), publishCampaign);

export default router;