import { Router } from 'express';
import { 
  getTrainingModules, 
  getTrainingModule,
  getUserProgress,
  completeTrainingModule,
  submitQuiz 
} from '../controllers/trainingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/modules', authenticate, getTrainingModules);
router.get('/modules/:id', authenticate, getTrainingModule);
router.get('/progress', authenticate, getUserProgress);
router.post('/modules/:id/complete', authenticate, completeTrainingModule);
router.post('/modules/:id/quiz', authenticate, submitQuiz);

export default router;