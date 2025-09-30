import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { GamificationService } from '../services/gamificationService.js';
import { prisma } from '../lib/prisma.js';

const gamificationService = new GamificationService();

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await gamificationService.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('GetLeaderboard error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du classement' });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainingProgress: {
          include: { module: true },
        },
        quizAttempts: {
          include: { quiz: true },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const badges = user.badges.map(badgeId => gamificationService.getBadgeDetails(badgeId));

    const rank = await prisma.user.count({
      where: { points: { gt: user.points } },
    }) + 1;

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        points: user.points,
        level: user.level,
        department: user.department,
        rank,
      },
      badges,
      trainingProgress: user.trainingProgress,
      recentQuizzes: user.quizAttempts,
    });
  } catch (error) {
    console.error('GetUserProfile error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
};

export const getBadges = async (_req: AuthRequest, res: Response) => {
  try {
    const gamificationService = new GamificationService();
    const badges = Object.values((gamificationService as any).BADGES);
    res.json(badges);
  } catch (error) {
    console.error('GetBadges error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des badges' });
  }
};