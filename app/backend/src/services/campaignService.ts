import { prisma } from '../lib/prisma.js';
import { EmailService } from './emailService.js';

export class CampaignService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async calculateCampaignStats(campaignId: string) {
    const targets = await prisma.campaignTarget.findMany({
      where: { campaignId },
    });

    const totalTargets = targets.length;
    const delivered = targets.filter((t) => t.status !== 'PENDING').length;
    const opened = targets.filter((t) => t.openedAt).length;
    const clicked = targets.filter((t) => t.clickedAt).length;
    const reported = targets.filter((t) => t.status === 'REPORTED').length;

    const fastReaders = targets.filter(
      (t) => t.readingMetrics && (t.readingMetrics as any).fastRead
    ).length;

    const clickRate = totalTargets > 0 ? (clicked / totalTargets) * 100 : 0;
    const openRate = totalTargets > 0 ? (opened / totalTargets) * 100 : 0;
    const fastReadRate = opened > 0 ? (fastReaders / opened) * 100 : 0;

    const totalReadingTime = targets.reduce((sum, t) => {
      return sum + ((t.readingMetrics as any)?.timeSpent || 0);
    }, 0);
    const avgReadingTime = opened > 0 ? totalReadingTime / opened : 0;

    const settings = await prisma.settings.findFirst();
    const alerts: string[] = [];

    if (settings) {
      if (clickRate / 100 > (settings.alertThresholds as any).clickRate) {
        alerts.push(
          `Taux de clic élevé (${clickRate.toFixed(1)}%) - Formation recommandée`
        );
      }
      if (fastReadRate / 100 > (settings.alertThresholds as any).fastRead) {
        alerts.push(
          `Taux de lecture rapide élevé (${fastReadRate.toFixed(1)}%) - Formation obligatoire recommandée`
        );
      }
    }

    return {
      totalTargets,
      delivered,
      opened,
      clicked,
      reported,
      clickRate,
      openRate,
      fastReadRate,
      avgReadingTime,
      alerts,
    };
  }

  async generateCampaignReport(campaignId: string) {
    return this.calculateCampaignStats(campaignId);
  }

  async publishCampaign(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { targets: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
      },
    });

    if (!campaign.sandboxMode) {
      for (const target of campaign.targets) {
        await this.emailService.sendPhishingEmail(
          target.email,
          campaign.subject,
          campaign.body,
          target.id,
          campaignId
        );

        await prisma.campaignTarget.update({
          where: { id: target.id },
          data: { status: 'DELIVERED' },
        });
      }
    } else {
      for (const target of campaign.targets) {
        await prisma.campaignTarget.update({
          where: { id: target.id },
          data: { status: 'DELIVERED' },
        });
      }
    }
  }
}