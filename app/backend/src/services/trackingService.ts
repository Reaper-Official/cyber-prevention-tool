import { PrismaClient } from '@prisma/client';

export class TrackingService {
  constructor(private prisma: PrismaClient) {}

  async trackOpen(trackingId: string, ipAddress: string) {
    const target = await this.prisma.campaignTarget.findUnique({
      where: { trackingId }
    });

    if (!target || target.openedAt) {
      return null;
    }

    return await this.prisma.campaignTarget.update({
      where: { trackingId },
      data: {
        openedAt: new Date(),
        openedIp: this.anonymizeIp(ipAddress),
        status: 'opened'
      }
    });
  }

  async trackClick(trackingId: string, ipAddress: string) {
    const target = await this.prisma.campaignTarget.findUnique({
      where: { trackingId }
    });

    if (!target) {
      return null;
    }

    // Enregistrer le premier clic seulement
    if (!target.clickedAt) {
      await this.prisma.campaignTarget.update({
        where: { trackingId },
        data: {
          clickedAt: new Date(),
          clickedIp: this.anonymizeIp(ipAddress),
          status: 'clicked'
        }
      });
    }

    // Incrémenter le compteur de clics
    await this.prisma.clickEvent.create({
      data: {
        targetId: target.id,
        timestamp: new Date(),
        ipAddress: this.anonymizeIp(ipAddress)
      }
    });

    return target;
  }

  async trackReading(trackingId: string, metrics: {
    timeSpent: number;
    wordCount: number;
    scrollDepth: number;
    focusTime: number;
    secondsPerWord: number;
    fastRead: boolean;
  }) {
    const target = await this.prisma.campaignTarget.findUnique({
      where: { trackingId }
    });

    if (!target) {
      return null;
    }

    return await this.prisma.campaignTarget.update({
      where: { trackingId },
      data: {
        readingTime: metrics.timeSpent,
        secondsPerWord: metrics.secondsPerWord,
        scrollDepth: metrics.scrollDepth,
        focusTime: metrics.focusTime,
        fastRead: metrics.fastRead,
        readingMetricsRecordedAt: new Date()
      }
    });
  }

  async trackSubmission(trackingId: string, data: any) {
    const target = await this.prisma.campaignTarget.findUnique({
      where: { trackingId }
    });

    if (!target) {
      return null;
    }

    await this.prisma.campaignTarget.update({
      where: { trackingId },
      data: {
        submittedAt: new Date(),
        status: 'compromised',
        submissionData: {
          fieldCount: data.fieldCount,
          timestamp: data.timestamp
        }
      }
    });

    // Créer une alerte pour l'administrateur
    await this.prisma.securityAlert.create({
      data: {
        type: 'credential_submission',
        severity: 'high',
        campaignId: target.campaignId,
        userId: target.userId,
        message: 'Utilisateur a soumis des informations lors de la simulation',
        timestamp: new Date()
      }
    });

    return target;
  }

  async getCampaignAnalytics(campaignId: string) {
    const targets = await this.prisma.campaignTarget.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            department: true,
            role: true
          }
        }
      }
    });

    // Analytics par département
    const departmentStats = this.aggregateByDepartment(targets);
    
    // Timeline des événements
    const timeline = await this.getEventTimeline(campaignId);
    
    // Taux de détection par heure
    const hourlyRates = this.calculateHourlyRates(targets);

    return {
      departmentStats,
      timeline,
      hourlyRates,
      riskScore: this.calculateRiskScore(targets),
      fastReaderPercentage: this.calculateFastReaderPercentage(targets)
    };
  }

  private anonymizeIp(ip: string): string {
    // Anonymiser l'IP en gardant seulement les 3 premiers octets
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    return 'xxx.xxx.xxx.xxx';
  }

  private aggregateByDepartment(targets: any[]) {
    const departments: { [key: string]: any } = {};

    targets.forEach(target => {
      const dept = target.user.department?.name || 'Unknown';
      
      if (!departments[dept]) {
        departments[dept] = {
          total: 0,
          opened: 0,
          clicked: 0,
          submitted: 0,
          fastRead: 0
        };
      }

      departments[dept].total++;
      if (target.openedAt) departments[dept].opened++;
      if (target.clickedAt) departments[dept].clicked++;
      if (target.submittedAt) departments[dept].submitted++;
      if (target.fastRead) departments[dept].fastRead++;
    });

    return Object.entries(departments).map(([name, stats]) => ({
      department: name,
      ...stats,
      clickRate: stats.total > 0 ? (stats.clicked / stats.total) * 100 : 0,
      compromiseRate: stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0
    }));
  }

  private async getEventTimeline(campaignId: string) {
    const events = await this.prisma.campaignEvent.findMany({
      where: { campaignId },
      orderBy: { timestamp: 'asc' },
      take: 100
    });

    return events.map(e => ({
      type: e.type,
      timestamp: e.timestamp,
      details: e.details
    }));
  }

  private calculateHourlyRates(targets: any[]) {
    const hourlyData: { [hour: number]: any } = {};

    targets.forEach(target => {
      if (target.clickedAt) {
        const hour = new Date(target.clickedAt).getHours();
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = { sent: 0, clicked: 0 };
        }
        
        hourlyData[hour].sent++;
        if (target.clickedAt) hourlyData[hour].clicked++;
      }
    });

    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour: parseInt(hour),
      rate: data.sent > 0 ? (data.clicked / data.sent) * 100 : 0
    }));
  }

  private calculateRiskScore(targets: any[]): number {
    const total = targets.length;
    if (total === 0) return 0;

    const clicked = targets.filter(t => t.clickedAt).length;
    const submitted = targets.filter(t => t.submittedAt).length;
    const fastRead = targets.filter(t => t.fastRead).length;

    const clickRate = clicked / total;
    const submitRate = submitted / total;
    const fastReadRate = fastRead / total;

    // Pondération des risques
    const riskScore = (clickRate * 40) + (submitRate * 40) + (fastReadRate * 20);
    
    return Math.min(Math.round(riskScore * 100), 100);
  }

  private calculateFastReaderPercentage(targets: any[]): number {
    const opened = targets.filter(t => t.openedAt).length;
    if (opened === 0) return 0;

    const fastReaders = targets.filter(t => t.fastRead).length;
    return (fastReaders / opened) * 100;
  }
}