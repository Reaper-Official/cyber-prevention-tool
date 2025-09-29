import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          minSecondsPerWord: 0.25,
          alertThresholds: {
            clickRate: 0.8,
            fastRead: 0.8,
          },
          sandboxMode: true,
          requireApproval: true,
          aiProvider: 'GEMINI',
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('GetSettings error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des paramètres' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { minSecondsPerWord, alertThresholds, sandboxMode, requireApproval, aiProvider } =
      req.body;

    const settings = await prisma.settings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        minSecondsPerWord,
        alertThresholds,
        sandboxMode,
        requireApproval,
        aiProvider,
      },
      update: {
        minSecondsPerWord,
        alertThresholds,
        sandboxMode,
        requireApproval,
        aiProvider,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_SETTINGS',
        details: req.body,
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('UpdateSettings error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des paramètres' });
  }
};