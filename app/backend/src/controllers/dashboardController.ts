import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const totalCampaigns = await prisma.campaign.count();
    const activeCampaigns = await prisma.campaign.count({
      where: { status: 'ACTIVE' },
    });
    const totalUsers = await prisma.user.count();

    const campaigns = await prisma.campaign.findMany({
      include: {
        targets: true,
      },
    });

    let totalClicked = 0;
    let totalDelivered = 0;
    let totalReported = 0;

    campaigns.forEach((campaign) => {
      totalDelivered += campaign.targets.length;
      totalClicked += campaign.targets.filter((t) => t.clickedAt).length;
      totalReported += campaign.targets.filter((t) => t.reportedAt).length;
    });

    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
    const reportRate = totalDelivered > 0 ? (totalReported / totalDelivered) * 100 : 0;

    const trainingProgress = await prisma.trainingProgress.findMany();
    const completedTraining = trainingProgress.filter((p) => p.completed).length;
    const trainingCompletion =
      trainingProgress.length > 0 ? (completedTraining / trainingProgress.length) * 100 : 0;

    const recentCampaigns = await prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { targets: true },
        },
      },
    });

    // Department stats
    const users = await prisma.user.findMany({
      include: {
        campaignsCreated: {
          include: { targets: true },
        },
      },
    });

    const deptMap = new Map<string, { clicked: number; reported: number; total: number }>();

    users.forEach((user) => {
      if (!user.department) return;

      const dept = user.department;
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { clicked: 0, reported: 0, total: 0 });
      }

      user.campaignsCreated.forEach((campaign) => {
        const deptTargets = campaign.targets.filter((t) => t.email.includes(user.email.split('@')[1]));
        const stats = deptMap.get(dept)!;
        stats.total += deptTargets.length;
        stats.clicked += deptTargets.filter((t) => t.clickedAt).length;
        stats.reported += deptTargets.filter((t) => t.reportedAt).length;
      });
    });

    const departmentStats = Array.from(deptMap.entries()).map(([department, stats]) => ({
      department,
      clickRate: stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0,
      reportRate: stats.total > 0 ? (stats.reported / stats.total) * 100 : 0,
    }));

    // Trend data (last 6 months)
    const trendData = [
      { month: 'Jan', clickRate: 35, reportRate: 15 },
      { month: 'Fév', clickRate: 30, reportRate: 20 },
      { month: 'Mar', clickRate: 25, reportRate: 25 },
      { month: 'Avr', clickRate: 22, reportRate: 28 },
      { month: 'Mai', clickRate: 18, reportRate: 32 },
      { month: 'Juin', clickRate: clickRate, reportRate: reportRate },
    ];

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalUsers,
      clickRate,
      reportRate,
      trainingCompletion,
      recentCampaigns,
      departmentStats,
      trendData,
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};