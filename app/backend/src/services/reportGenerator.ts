import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export class ReportGenerator {
  async generatePDF(report: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(20).text('Rapport de Campagne de Phishing', { align: 'center' });
      doc.moveDown();
      
      // Informations de la campagne
      doc.fontSize(14).text(`Campagne: ${report.campaign.name}`);
      doc.fontSize(12).text(`Date: ${new Date(report.campaign.launchedAt).toLocaleDateString()}`);
      doc.text(`Statut: ${report.campaign.status}`);
      doc.moveDown();

      // Résumé exécutif
      if (report.aiAnalysis?.executiveSummary) {
        doc.fontSize(14).text('Résumé Exécutif', { underline: true });
        doc.fontSize(10).text(report.aiAnalysis.executiveSummary);
        doc.moveDown();
      }

      // Statistiques
      doc.fontSize(14).text('Statistiques', { underline: true });
      doc.fontSize(10);
      doc.text(`• Emails envoyés: ${report.stats.total}`);
      doc.text(`• Emails ouverts: ${report.stats.opened} (${Math.round(report.stats.opened/report.stats.total*100)}%)`);
      doc.text(`• Clics sur liens: ${report.stats.clicked} (${report.stats.clickRate.toFixed(1)}%)`);
      doc.text(`• Données soumises: ${report.stats.submitted} (${report.stats.submissionRate.toFixed(1)}%)`);
      doc.text(`• Lectures rapides: ${report.stats.fastReaders} (${report.stats.fastReadRate.toFixed(1)}%)`);
      doc.moveDown();

      // Évaluation du risque
      if (report.aiAnalysis?.riskAssessment) {
        doc.fontSize(14).text('Évaluation du Risque', { underline: true });
        doc.fontSize(10);
        doc.text(`• Niveau: ${report.aiAnalysis.riskAssessment.level}`);
        doc.text(`• Score: ${report.aiAnalysis.riskAssessment.score}/100`);
        doc.text(`• Justification: ${report.aiAnalysis.riskAssessment.justification}`);
        doc.moveDown();
      }

      // Recommandations
      if (report.recommendations && report.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(14).text('Recommandations', { underline: true });
        doc.fontSize(10);
        report.recommendations.forEach((rec: string) => {
          doc.text(`• ${rec}`);
        });
        doc.moveDown();
      }

      // Plan de formation
      if (report.aiAnalysis?.trainingPlan) {
        doc.fontSize(14).text('Plan de Formation', { underline: true });
        doc.fontSize(12).text('Actions Immédiates:', { underline: true });
        doc.fontSize(10);
        report.aiAnalysis.trainingPlan.immediate.forEach((action: string) => {
          doc.text(`• ${action}`);
        });
        
        doc.fontSize(12).text('Court Terme:', { underline: true });
        doc.fontSize(10);
        report.aiAnalysis.trainingPlan.shortTerm.forEach((action: string) => {
          doc.text(`• ${action}`);
        });
        
        doc.fontSize(12).text('Long Terme:', { underline: true });
        doc.fontSize(10);
        report.aiAnalysis.trainingPlan.longTerm.forEach((action: string) => {
          doc.text(`• ${action}`);
        });
      }

      // Pied de page
      doc.fontSize(8).text(
        'Ce rapport est confidentiel et destiné uniquement à un usage interne.',
        50, 750,
        { align: 'center' }
      );

      doc.end();
    });
  }

  async generateCSV(report: any): Promise<string> {
    const fields = [
      'user',
      'email', 
      'department',
      'status',
      'opened',
      'clicked',
      'submitted',
      'fastRead',
      'readingTime'
    ];

    const parser = new Parser({ fields });
    
    try {
      const csv = parser.parse(report.targetDetails);
      return csv;
    } catch (err) {
      console.error('Error generating CSV:', err);
      throw err;
    }
  }

  async generateExcel(report: any): Promise<Buffer> {
    // Implementation avec ExcelJS ou similaire
    // Pour simplifier, on retourne un CSV pour l'instant
    const csv = await this.generateCSV(report);
    return Buffer.from(csv);
  }
}