import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const getTrainingModules = async (req: AuthRequest, res: Response) => {
  try {
    const modules = await prisma.trainingModule.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        points: true,
        order: true,
      },
    });

    res.json(modules);
  } catch (error) {
    console.error('GetTrainingModules error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getTrainingModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
      include: {
        quiz: true,
      },
    });

    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    res.json(module);
  } catch (error) {
    console.error('GetTrainingModule error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getUserProgress = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.trainingProgress.findMany({
      where: { userId: req.user!.id },
      select: {
        moduleId: true,
        completed: true,
        score: true,
        needsFollowUp: true,
        completedAt: true,
      },
    });

    res.json(progress);
  } catch (error) {
    console.error('GetUserProgress error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const completeTrainingModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { readingStats, score } = req.body;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    const needsFollowUp = readingStats?.suspicious || readingStats?.wordsPerMinute < 150;

    // Vérifier si déjà complété
    const existing = await prisma.trainingProgress.findFirst({
      where: {
        userId: req.user!.id,
        moduleId: id,
      },
    });

    if (existing) {
      await prisma.trainingProgress.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
          readingTime: readingStats?.focusTimeSeconds,
          readingSpeed: readingStats?.wordsPerMinute,
          score: score,
          needsFollowUp,
        },
      });
    } else {
      await prisma.trainingProgress.create({
        data: {
          userId: req.user!.id,
          moduleId: id,
          completed: true,
          completedAt: new Date(),
          readingTime: readingStats?.focusTimeSeconds,
          readingSpeed: readingStats?.wordsPerMinute,
          score: score,
          needsFollowUp,
        },
      });
    }

    // Ajouter des points si lecture correcte
    if (!needsFollowUp) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          points: { increment: module.points },
        },
      });
    }

    res.json({ 
      success: true, 
      needsFollowUp,
      message: needsFollowUp 
        ? 'Formation validée mais nécessite un suivi'
        : 'Formation complétée avec succès'
    });
  } catch (error) {
    console.error('CompleteTrainingModule error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const quiz = await prisma.quiz.findFirst({
      where: { moduleId: id },
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

    res.json({
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('SubmitQuiz error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};