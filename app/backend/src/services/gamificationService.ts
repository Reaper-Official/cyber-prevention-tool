import { prisma } from '../lib/prisma.js';

export class GamificationService {
  private readonly BADGES = {
    FIRST_REPORT: {
      id: 'first_report',
      name: 'Première Alerte',
      description: 'A signalé son premier email suspect',
      icon: '🚨',
      points: 50,
    },
    VIGILANT: {
      id: 'vigilant',
      name: 'Œil de Lynx',
      description: 'A signalé 10 emails suspects',
      icon: '👁️',
      points: 100,
    },
    GUARDIAN: {
      id: 'guardian',
      name: 'Gardien',
      description: 'A signalé 50 emails suspects',
      icon: '🛡️',
      points: 250,
    },
    TRAINING_COMPLETE: {
      id: 'training_complete',
      name: 'Étudiant Assidu',
      description: 'A terminé tous les modules de formation',
      icon: '🎓',
      points: 150,
    },
    PERFECT_SCORE: {
      id: 'perfect_score',
      name: 'Perfection',
      description: 'A obtenu 100% à un quiz',
      icon: '⭐',
      points: 75,
    },
    SPEED_READER: {
      id: 'speed_reader',
      name: 'Lecteur Rapide',
      description: 'A lu 5 modules en moins de temps que prévu',
      icon: '⚡',
      points: 50,
    },
    SECURITY_CHAMPION: {
      id: 'security_champion',
      name: 'Champion de la Sécurité',
      description: 'Niveau 10 atteint',
      icon: '👑',
      points: 500,
    },
  };

  async awardPoints(userId: string, points: number, reason: string) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        points: { increment: points },
      },
    });

    const newLevel = this.calculateLevel(user.points);
    if (newLevel > user.level) {
      await this.levelUp(userId, newLevel);
    }

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'POINTS_AWARDED',
        details: { points, reason, totalPoints: user.points },
      },
    });

    return user;
  }

  private calculateLevel(points: number): number {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  private async levelUp(userId: string, newLevel: number) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Nouveau Niveau!',
        message: `Félicitations! Vous avez atteint le niveau ${newLevel}!`,
        type: 'LEVEL_UP',
      },
    });

    if (newLevel === 10) {
      await this.awardBadge(userId, 'SECURITY_CHAMPION');
    }
  }

  async awardBadge(userId: string, badgeId: keyof typeof this.BADGES) {
    const badge = this.BADGES[badgeId];
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user && !user.badges.includes(badge.id)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          badges: { push: badge.id },
          points: { increment: badge.points },
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          title: 'Nouveau Badge!',
          message: `Vous avez débloqué: ${badge.name} - ${badge.description}`,
          type: 'BADGE_EARNED',
        },
      });
    }
  }

  async checkAndAwardBadges(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainingProgress: true,
        quizAttempts: true,
      },
    });

    if (!user) return;

    const reportedCount = await prisma.campaignTarget.count({
      where: { userId, status: 'REPORTED' },
    });

    if (reportedCount >= 1 && !user.badges.includes('first_report')) {
      await this.awardBadge(userId, 'FIRST_REPORT');
    }

    if (reportedCount >= 10 && !user.badges.includes('vigilant')) {
      await this.awardBadge(userId, 'VIGILANT');
    }

    if (reportedCount >= 50 && !user.badges.includes('guardian')) {
      await this.awardBadge(userId, 'GUARDIAN');
    }

    const completedModules = user.trainingProgress.filter(p => p.completed).length;
    const totalModules = await prisma.trainingModule.count();

    if (completedModules === totalModules && !user.badges.includes('training_complete')) {
      await this.awardBadge(userId, 'TRAINING_COMPLETE');
    }

    const perfectScores = user.quizAttempts.filter(a => a.score === 100).length;
    if (perfectScores >= 1 && !user.badges.includes('perfect_score')) {
      await this.awardBadge(userId, 'PERFECT_SCORE');
    }
  }

  async getLeaderboard(limit: number = 10) {
    return await prisma.user.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        points: true,
        level: true,
        badges: true,
        department: true,
      },
    });
  }

  getBadgeDetails(badgeId: string) {
    return Object.values(this.BADGES).find(b => b.id === badgeId);
  }
}