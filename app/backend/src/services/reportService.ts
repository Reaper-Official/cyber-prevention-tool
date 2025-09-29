import { prisma } from '../lib/prisma.js';
import { CampaignService } from './campaignService.js';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export class ReportService {
  private campaignService: CampaignService;

  constructor() {
    this.campaignService = new CampaignService();
  }

  async exportToCSV(campaignId: string): Promise<string> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { targets: true },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const data = campaign.targets.map((target) => ({
      email: this.anonymizeEmail(target.email),
      status: target.status,
      opened: target.openedAt ? 'Oui' : 'Non',
      clicked: target.clickedAt ? 'Oui' : 'Non',
      readingTime: (target.readingMetrics as any)?.timeSpent || 0,
      fastRead: (target.readingMetrics as any)?.fastRead ? 'Oui' : 'Non',
    }));

    const parser = new Parser();
    return parser.parse(data);
  }

  async exportToPDF(campaignId: string): Promise<Buffer> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const stats = await this.campaignService.calculateCampaignStats(campaignId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      doc.fontSize(20).text('Rapport de Campagne PhishGuard', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Campagne: ${campaign.name}`);
      doc.moveDown();
      doc.fontSize(12).text(`Cibles totales: ${stats.totalTargets}`);
      doc.text(`Taux d'ouverture: ${stats.openRate.toFixed(1)}%`);
      doc.text(`Taux de clic: ${stats.clickRate.toFixed(1)}%`);
      doc.text(`Taux de lecture rapide: ${stats.fastReadRate.toFixed(1)}%`);
      doc.text(`Temps de lecture moyen: ${stats.avgReadingTime.toFixed(0)}s`);

      if (stats.alerts.length > 0) {
        doc.moveDown();
        doc.fontSize(14).text('Alertes:', { underline: true });
        stats.alerts.forEach((alert) => {
          doc.fontSize(10).text(`• ${alert}`);
        });
      }

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