import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { GamificationService } from '../services/gamificationService.js';

const gamificationService = new GamificationService();

export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { moduleId } = req.params;

    const quiz = await prisma.quiz.findFirst({
      where: { moduleId },
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('GetQuiz error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du quiz' });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz non trouvé' });
    }

    const questions = quiz.questions as any[];
    let correctCount = 0;

    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user!.id,
        quizId,
        answers,
        score,
        passed,
      },
    });

    if (passed) {
      await gamificationService.awardPoints(
        req.user!.id,
        20,
        `Quiz réussi: ${score}%`
      );
    }

    await gamificationService.checkAndAwardBadges(req.user!.id);

    res.json({
      attempt,
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('SubmitQuiz error:', error);
    res.status(500).json({ message: 'Erreur lors de la soumission du quiz' });
  }
};

export const getQuizAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user!.id },
      include: {
        quiz: {
          include: {
            module: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    res.json(attempts);
  } catch (error) {
    console.error('GetQuizAttempts error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des tentatives' });
  }
};