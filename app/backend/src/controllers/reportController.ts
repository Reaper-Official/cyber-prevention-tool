import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { ReportService } from '../services/reportService.js';

const reportService = new ReportService();

export const exportCampaignReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { format } = req.query;

    if (format === 'csv') {
      const csv = await reportService.exportToCSV(id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=campaign_${id}_report.csv`);
      res.send(csv);
    } else if (format === 'pdf') {
      const pdf = await reportService.exportToPDF(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=campaign_${id}_report.pdf`);
      res.send(pdf);
    } else {
      res.status(400).json({ message: 'Format non supporté' });
    }
  } catch (error) {
    console.error('ExportCampaignReport error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export' });
  }
};