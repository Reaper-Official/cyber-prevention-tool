import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { CampaignService } from '../services/campaignService.js';

const campaignService = new CampaignService();

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
  try {
    const totalCampaigns = await prisma.campaign.count();
    const activeCampaigns = await prisma.campaign.count({
      where: { status: 'ACTIVE' },
    });
    const totalTargets = await prisma.campaignTarget.count();

    const campaigns = await prisma.campaign.findMany({
      where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
    });

    let totalClickRate = 0;
    let totalFastReadRate = 0;
    let alertCount = 0;

    for (const campaign of campaigns) {
      const stats = await campaignService.calculateCampaignStats(campaign.id);
      totalClickRate += stats.clickRate;
      totalFastReadRate += stats.fastReadRate;
      if (stats.alerts.length > 0) {
        alertCount++;
      }
    }

    const averageClickRate = campaigns.length > 0 ? totalClickRate / campaigns.length : 0;
    const averageFastReadRate = campaigns.length > 0 ? totalFastReadRate / campaigns.length : 0;

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalTargets,
      averageClickRate,
      averageFastReadRate,
      alertCount,
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
};