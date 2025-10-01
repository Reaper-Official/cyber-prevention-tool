import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const completeModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { readingStats } = req.body;

    const module = await prisma.trainingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return res.status(404).json({ message: 'Module non trouvé' });
    }

    // Vérifier si déjà complété
    const existing = await prisma.trainingProgress.findFirst({
      where: {
        userId: req.user!.id,
        moduleId: id,
      },
    });

    const needsFollowUp = readingStats.suspicious || readingStats.wordsPerMinute < 150;

    if (existing) {
      await prisma.trainingProgress.update({
        where: { id: existing.id },
        data: {
          completed: true,
          completedAt: new Date(),
          readingTime: readingStats.focusTimeSeconds,
          readingSpeed: readingStats.wordsPerMinute,
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
          readingTime: readingStats.focusTimeSeconds,
          readingSpeed: readingStats.wordsPerMinute,
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
    console.error('CompleteModule error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};