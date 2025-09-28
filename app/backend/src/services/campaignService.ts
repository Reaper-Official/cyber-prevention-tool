import { PrismaClient, Campaign, User } from '@prisma/client';
import { AIProvider } from './aiProvider';
import { ReportGenerator } from './reportGenerator';
import { AppError } from '../middleware/errorHandler';

export class CampaignService {
  constructor(
    private prisma: PrismaClient,
    private aiProvider: AIProvider = new AIProvider(),
    private reportGenerator: ReportGenerator = new ReportGenerator()
  ) {}

  async getAllCampaigns(userId: string) {
    return await this.prisma.campaign.findMany({
      include: {
        createdBy: { select: { email: true, firstName: true, lastName: true } },
        _count: { select: { targets: true } },
        validation: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCampaign(campaignId: string) {
    return await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        targets: {
          include: {
            user: true
          }
        },
        createdBy: true,
        validation: {
          include: {
            validator: true
          }
        }
      }
    });
  }

  async createCampaign(data: {
    name: string;
    targetType: string;
    targetIds?: string[];
    createdById: string;
    status: string;
  }) {
    // Créer la campagne
    const campaign = await this.prisma.campaign.create({
      data: {
        name: data.name,
        targetType: data.targetType,
        status: data.status,
        createdById: data.createdById,
        subject: '',
        body: '',
        fromName: 'Security Team',
        fromEmail: 'security@company.com',
        sandbox: process.env.SANDBOX_MODE === 'true'
      }
    });

    // Ajouter les cibles
    const targets = await this.getTargetUsers(data.targetType, data.targetIds);
    
    await this.prisma.campaignTarget.createMany({
      data: targets.map(user => ({
        campaignId: campaign.id,
        userId: user.id,
        status: 'pending'
      }))
    });

    return campaign;
  }

  async getTargetUsers(targetType: string, targetIds?: string[]): Promise<User[]> {
    switch (targetType) {
      case 'department':
        return await this.prisma.user.findMany({
          where: { departmentId: { in: targetIds } }
        });
      
      case 'specific_users':
        return await this.prisma.user.findMany({
          where: { id: { in: targetIds } }
        });
      
      case 'all':
        return await this.prisma.user.findMany({
          where: { active: true }
        });
      
      default:
        throw new AppError(400, 'Invalid target type');
    }
  }

  async updateCampaignTemplate(campaignId: string, template: any) {
    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        subject: template.subject,
        body: template.body,
        landingPageContent: template.landingPage,
        hasPersonalization: template.personalized || false
      }
    });
  }

  async submitForApproval(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'draft') {
      throw new AppError(400, 'Only draft campaigns can be submitted for approval');
    }

    return await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'pending_approval',
        submittedAt: new Date()
      }
    });
  }

  async validateCampaign(
    campaignId: string,
    validatorId: string,
    approved: boolean,
    comments?: string
  ) {
    const validation = await this.prisma.campaignValidation.create({
      data: {
        campaignId,
        validatorId,
        approved,
        comments,
        validatedAt: new Date()
      }
    });

    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: approved ? 'approved' : 'rejected'
      }
    });

    return validation;
  }

  async launchCampaign(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    // Mettre à jour le statut
    const updatedCampaign = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'active',
        launchedAt: new Date()
      }
    });

    // Créer les tracking IDs pour chaque cible
    const targets = await this.prisma.campaignTarget.findMany({
      where: { campaignId }
    });

    for (const target of targets) {
      const trackingId = this.generateTrackingId();
      await this.prisma.campaignTarget.update({
        where: { id: target.id },
        data: { 
          trackingId,
          status: 'sent',
          sentAt: new Date()
        }
      });
    }

    return updatedCampaign;
  }

  async getCampaignStats(campaignId: string) {
    const targets = await this.prisma.campaignTarget.findMany({
      where: { campaignId }
    });

    const stats = {
      total: targets.length,
      sent: targets.filter(t => t.status === 'sent').length,
      opened: targets.filter(t => t.openedAt !== null).length,
      clicked: targets.filter(t => t.clickedAt !== null).length,
      submitted: targets.filter(t => t.submittedAt !== null).length,
      fastReaders: targets.filter(t => t.fastRead === true).length,
      averageReadTime: 0,
      clickRate: 0,
      submissionRate: 0,
      fastReadRate: 0
    };

    if (stats.sent > 0) {
      stats.clickRate = (stats.clicked / stats.sent) * 100;
      stats.submissionRate = (stats.submitted / stats.sent) * 100;
      stats.fastReadRate = (stats.fastReaders / stats.opened) * 100;
    }

    // Calculer le temps de lecture moyen
    const readTimes = targets
      .filter(t => t.readingTime !== null)
      .map(t => t.readingTime as number);
    
    if (readTimes.length > 0) {
      stats.averageReadTime = readTimes.reduce((a, b) => a + b, 0) / readTimes.length;
    }

    // Vérifier les seuils d'alerte
    const alerts = [];
    if (stats.clickRate > parseFloat(process.env.ALERT_THRESHOLD_CLICK_RATE || '70')) {
      alerts.push({
        type: 'high_click_rate',
        message: `Taux de clic élevé: ${stats.clickRate.toFixed(1)}%`,
        severity: 'warning'
      });
    }

    if (stats.fastReadRate > parseFloat(process.env.ALERT_THRESHOLD_FAST_READ || '80')) {
      alerts.push({
        type: 'high_fast_read',
        message: `Taux de lecture rapide élevé: ${stats.fastReadRate.toFixed(1)}%`,
        severity: 'warning',
        recommendation: 'Formation renforcée recommandée'
      });
    }

    return { ...stats, alerts };
  }

  async generateReport(campaignId: string) {
    const campaign = await this.getCampaign(campaignId);
    const stats = await this.getCampaignStats(campaignId);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    // Générer le rapport via IA si des fast readers sont détectés
    let aiAnalysis = null;
    if (stats.fastReadRate > 50) {
      aiAnalysis = await this.aiProvider.generateReportAnalysis({
        campaign,
        stats,
        fastReaderDetails: await this.getFastReaderDetails(campaignId)
      });
    }

    return {
      campaign: {
        id: campaign.id,
        name: campaign.name,
        launchedAt: campaign.launchedAt,
        status: campaign.status
      },
      stats,
      aiAnalysis,
      recommendations: this.generateRecommendations(stats),
      targetDetails: await this.getTargetDetails(campaignId)
    };
  }

  async exportReport(campaignId: string, format: string) {
    const report = await this.generateReport(campaignId);
    
    if (format === 'pdf') {
      return await this.reportGenerator.generatePDF(report);
    } else if (format === 'csv') {
      return await this.reportGenerator.generateCSV(report);
    }
    
    throw new AppError(400, 'Invalid export format');
  }

  async getAvailableTemplates() {
    return await this.prisma.emailTemplate.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        description: true,
        previewSubject: true
      }
    });
  }

  async getTemplate(templateId: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new AppError(404, 'Template not found');
    }

    return template;
  }

  private generateTrackingId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private async getFastReaderDetails(campaignId: string) {
    return await this.prisma.campaignTarget.findMany({
      where: {
        campaignId,
        fastRead: true
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            department: true,
            role: true
          }
        }
      }
    });
  }

  private async getTargetDetails(campaignId: string) {
    const targets = await this.prisma.campaignTarget.findMany({
      where: { campaignId },
      include: {
        user: {
          select: {
            email: true,
            department: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return targets.map(t => ({
      user: `${t.user.firstName} ${t.user.lastName}`,
      email: t.user.email,
      department: t.user.department?.name,
      status: t.status,
      opened: t.openedAt !== null,
      clicked: t.clickedAt !== null,
      submitted: t.submittedAt !== null,
      fastRead: t.fastRead,
      readingTime: t.readingTime
    }));
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations = [];

    if (stats.clickRate > 70) {
      recommendations.push('Formation urgente recommandée pour l\'ensemble des employés');
    }

    if (stats.fastReadRate > 80) {
      recommendations.push('Session de sensibilisation approfondie nécessaire');
      recommendations.push('Envisager une formation en présentiel avec consultant');
    }

    if (stats.submissionRate > 30) {
      recommendations.push('Révision des politiques de sécurité des mots de passe');
    }

    if (stats.averageReadTime < 10) {
      recommendations.push('Améliorer la communication sur l\'importance de la vigilance');
    }

    return recommendations;
  }
}