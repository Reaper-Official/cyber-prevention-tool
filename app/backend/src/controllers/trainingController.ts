import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getTrainingModules = async (req: AuthRequest, res: Response) => {
  try {
    const modules = await prisma.trainingModule.findMany({
      orderBy: { order: 'asc' },
    });

    const userProgress = await prisma.trainingProgress.findMany({
      where: { userId: req.user!.id },
    });

    const modulesWithProgress = modules.map((module) => ({
      ...module,
      completed: userProgress.some((p) => p.moduleId === module.id && p.completed),
    }));

    res.json(modulesWithProgress);
  } catch (error) {
    console.error('GetTrainingModules error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des modules' });
  }
};

export const completeTrainingModule = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.trainingProgress.upsert({
      where: {
        userId_moduleId: {
          userId: req.user!.id,
          moduleId: id,
        },
      },
      create: {
        userId: req.user!.id,
        moduleId: id,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    res.json({ message: 'Module terminé avec succès' });
  } catch (error) {
    console.error('CompleteTrainingModule error:', error);
    res.status(500).json({ message: 'Erreur lors de la complétion du module' });
  }
};