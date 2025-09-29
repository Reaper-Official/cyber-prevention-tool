import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { generateContent } from '../controllers/aiController.js';

const router = Router();

router.post(
  '/generate',
  authenticate,
  [body('templateType').notEmpty(), body('context').isObject()],
  generateContent
);

export default router;