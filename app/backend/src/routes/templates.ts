import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  useTemplate,
} from '../controllers/templateController.js';

const router = Router();

router.get('/', authenticate, getTemplates);
router.get('/:id', authenticate, getTemplate);
router.post('/', authenticate, authorize('ADMIN', 'HR'), createTemplate);
router.put('/:id', authenticate, authorize('ADMIN', 'HR'), updateTemplate);
router.post('/:id/use', authenticate, useTemplate);

export default router;