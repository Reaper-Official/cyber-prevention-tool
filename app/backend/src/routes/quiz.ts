import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { getQuiz, submitQuiz, getQuizAttempts } from '../controllers/quizController.js';

const router = Router();

router.get('/module/:moduleId', authenticate, getQuiz);
router.post('/:quizId/submit', authenticate, submitQuiz);
router.get('/attempts', authenticate, getQuizAttempts);

export default router;