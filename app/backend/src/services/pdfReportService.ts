import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma.js';
import { CampaignService } from './campaignService.js';

export class PDFReportService {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  async generateCampaignReport(campaignId: string): Promise<Buffer> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        targets: true,
        createdBy: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const stats = await this.campaignService.calculateCampaignStats(campaignId);
    const settings = await prisma.settings.findFirst();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc
        .fontSize(24)
        .fillColor(settings?.primaryColor || '#0ea5e9')
        .text(settings?.companyName || 'PhishGuard', { align: 'center' });

      doc
        .moveDown()
        .fontSize(18)
        .fillColor('#000000')
        .text('Rapport de Campagne de Sensibilisation', { align: 'center' });

      doc.moveDown(2);

      doc.fontSize(14).text('Informations de la Campagne', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Nom: ${campaign.name}`);
      doc.text(`Date de création: ${campaign.createdAt.toLocaleDateString('fr-FR')}`);
      doc.text(`Créée par: ${campaign.createdBy.name}`);
      doc.text(`Statut: ${campaign.status}`);
      doc.text(`Mode: ${campaign.sandboxMode ? 'Sandbox' : 'Production'}`);

      if (campaign.targetDepartments.length > 0) {
        doc.text(`Départements ciblés: ${campaign.targetDepartments.join(', ')}`);
      }

      doc.moveDown(2);

      doc.fontSize(14).text('Statistiques Globales', { underline: true });
      doc.moveDown(0.5);

      const statsData = [
        ['Cibles totales', stats.totalTargets.toString()],
        ['Emails envoyés', stats.delivered.toString()],
        ['Emails ouverts', `${stats.opened} (${stats.openRate.toFixed(1)}%)`],
        ['Clics sur liens', `${stats.clicked} (${stats.clickRate.toFixed(1)}%)`],
        ['Signalements', `${stats.reported}`],
        ['Lecture rapide', `${stats.fastReadRate.toFixed(1)}%`],
        ['Temps moyen', `${stats.avgReadingTime.toFixed(0)}s`],
      ];

      statsData.forEach(([label, value]) => {
        doc.fontSize(11).text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value);
        doc.font('Helvetica');
      });

      doc.moveDown(2);

      if (stats.alerts.length > 0) {
        doc
          .fontSize(14)
          .fillColor('#ef4444')
          .text('Alertes de Sécurité', { underline: true });
        doc.fillColor('#000000');
        doc.moveDown(0.5);

        stats.alerts.forEach((alert) => {
          doc.fontSize(10).text(`• ${alert}`);
        });

        doc.moveDown(2);
      }

      doc.fontSize(14).text('Recommandations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      if (stats.clickRate > 30) {
        doc.text('⚠️ Taux de clic élevé: Formation renforcée recommandée pour l\'ensemble du personnel.');
      }

      if (stats.fastReadRate > 50) {
        doc.text(
          '⚠️ Taux de lecture rapide critique: Mettre en place des sessions de formation obligatoires.'
        );
      }

      if (stats.reported < stats.clicked * 0.1) {
        doc.text(
          '💡 Peu de signalements: Sensibiliser davantage aux procédures de signalement d\'emails suspects.'
        );
      }

      if (stats.clickRate < 10) {
        doc.text('✅ Excellent résultat: Le personnel démontre une bonne vigilance.');
      }

      doc.moveDown(2);

      const topPerformers = campaign.targets
        .filter((t) => t.status === 'REPORTED')
        .slice(0, 5);

      if (topPerformers.length > 0) {
        doc.fontSize(14).text('Personnel Vigilant', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text('Les employés suivants ont correctement identifié et signalé l\'email:');
        doc.moveDown(0.3);

        topPerformers.forEach((target) => {
          doc.text(`• ${this.anonymizeEmail(target.email)}`);
        });
      }

      doc
        .moveDown(3)
        .fontSize(8)
        .fillColor('#666666')
        .text(
          `Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
          { align: 'center' }
        );

      doc.text('Document confidentiel - Usage interne uniquement', { align: 'center' });

      doc.end();
    });
  }

  async generateUserReport(userId: string): Promise<Buffer> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainingProgress: {
          include: { module: true },
        },
        quizAttempts: {
          include: { quiz: true },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const settings = await prisma.settings.findFirst();
    const reportedCount = await prisma.campaignTarget.count({
      where: { userId, status: 'REPORTED' },
    });

    const totalModules = await prisma.trainingModule.count();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc
        .fontSize(24)
        .fillColor(settings?.primaryColor || '#0ea5e9')
        .text(settings?.companyName || 'PhishGuard', { align: 'center' });

      doc
        .moveDown()
        .fontSize(18)
        .fillColor('#000000')
        .text('Rapport Individuel de Sensibilisation', { align: 'center' });

      doc.moveDown(2);

      doc.fontSize(14).text('Informations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Nom: ${user.name}`);
      doc.text(`Département: ${user.department || 'Non spécifié'}`);
      doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`);

      doc.moveDown(2);

      doc.fontSize(14).text('Progression', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Points: ${user.points}`);
      doc.text(`Niveau: ${user.level}`);
      doc.text(`Badges obtenus: ${user.badges.length}`);
      doc.text(`Emails suspects signalés: ${reportedCount}`);

      doc.moveDown(2);

      doc.fontSize(14).text('Formation', { underline: true });
      doc.moveDown(0.5);

      const completedModules = user.trainingProgress.filter((p) => p.completed).length;

      doc.fontSize(11);
      doc.text(`Modules complétés: ${completedModules}/${totalModules}`);
      doc.moveDown(0.5);

      user.trainingProgress
        .filter((p) => p.completed)
        .forEach((progress) => {
          doc.fontSize(10).text(`✓ ${progress.module.title}`, { indent: 20 });
        });

      doc.moveDown(2);

      if (user.quizAttempts.length > 0) {
        doc.fontSize(14).text('Résultats des Quiz', { underline: true });
        doc.moveDown(0.5);

        const avgScore =
          user.quizAttempts.reduce((sum, a) => sum + a.score, 0) / user.quizAttempts.length;

        doc.fontSize(11).text(`Score moyen: ${avgScore.toFixed(1)}%`);
        doc.text(`Tentatives: ${user.quizAttempts.length}`);
        doc.text(`Réussites: ${user.quizAttempts.filter((a) => a.passed).length}`);
      }

      doc
        .moveDown(3)
        .fontSize(8)
        .fillColor('#666666')
        .text(
          `Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`,
          { align: 'center' }
        );

      doc.end();
    });
  }

  private anonymizeEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (local.length <= 3) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.substring(0, 3)}***@${domain}`;
  }
}