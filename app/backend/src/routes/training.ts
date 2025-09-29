import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getTrainingModules, completeTrainingModule } from '../controllers/trainingController.js';

const router = Router();

router.get('/modules', authenticate, getTrainingModules);
router.post('/modules/:id/complete', authenticate, completeTrainingModule);

export default router;