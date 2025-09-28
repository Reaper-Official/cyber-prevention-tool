import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import handlebars from 'handlebars';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (process.env.SANDBOX_MODE === 'true') {
      console.log('Email service in SANDBOX mode - no real emails will be sent');
      return;
    }

    if (!process.env.SMTP_HOST) {
      console.warn('SMTP not configured - emails will not be sent');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendCampaignEmails(campaign: any) {
    if (process.env.SANDBOX_MODE === 'true') {
      console.log(`[SANDBOX] Would send ${campaign.targets.length} emails for campaign ${campaign.id}`);
      
      // Simuler l'envoi en sandbox
      for (const target of campaign.targets) {
        await this.prisma.campaignTarget.update({
          where: { id: target.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        });
      }
      return;
    }

    if (!this.transporter) {
      throw new AppError(500, 'Email service not configured');
    }

    const template = handlebars.compile(campaign.body);

    for (const target of campaign.targets) {
      try {
        // Personnaliser le contenu
        const personalizedBody = template({
          firstName: target.user.firstName,
          lastName: target.user.lastName,
          department: target.user.department?.name,
          trackingLink: `${process.env.APP_URL}/track/click/${target.trackingId}`,
          trackingPixel: `${process.env.APP_URL}/track/open/${target.trackingId}`
        });

        // Ajouter le pixel de tracking
        const bodyWithTracking = personalizedBody + 
          `<img src="${process.env.APP_URL}/track/open/${target.trackingId}" width="1" height="1" style="display:none;" />`;

        await this.transporter.sendMail({
          from: `"${campaign.fromName}" <${campaign.fromEmail}>`,
          to: target.user.email,
          subject: campaign.subject,
          html: bodyWithTracking
        });

        await this.prisma.campaignTarget.update({
          where: { id: target.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        });

        // Log l'envoi
        await this.prisma.campaignEvent.create({
          data: {
            campaignId: campaign.id,
            type: 'email_sent',
            details: {
              targetId: target.id,
              email: target.user.email
            }
          }
        });

        // Délai entre les envois pour éviter le spam
        await this.delay(Math.random() * 2000 + 1000); // 1-3 secondes

      } catch (error) {
        console.error(`Failed to send email to ${target.user.email}:`, error);
        
        await this.prisma.campaignTarget.update({
          where: { id: target.id },
          data: {
            status: 'failed'
          }
        });
      }
    }
  }

  async notifyValidators(campaign: any) {
    // Récupérer les validateurs
    const validators = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['Admin', 'Validator', 'HR'] }
        },
        active: true
      }
    });

    const emailContent = `
      <h2>Nouvelle campagne en attente de validation</h2>
      <p><strong>Nom de la campagne:</strong> ${campaign.name}</p>
      <p><strong>Créée par:</strong> ${campaign.createdBy.email}</p>
      <p><strong>Nombre de cibles:</strong> ${campaign._count.targets}</p>
      <p><strong>Type de ciblage:</strong> ${campaign.targetType}</p>
      
      <p>Veuillez vous connecter à la plateforme pour examiner et valider cette campagne.</p>
      
      <a href="${process.env.APP_URL}/campaigns/${campaign.id}/validate" 
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Examiner la campagne
      </a>
      
      <p style="margin-top: 24px; color: #666; font-size: 14px;">
        ⚠️ Rappel: Cette campagne est à des fins de formation uniquement. 
        Veuillez vérifier la conformité éthique avant validation.
      </p>
    `;

    for (const validator of validators) {
      await this.sendNotificationEmail(
        validator.email,
        'Action requise: Validation de campagne',
        emailContent
      );
    }
  }

  async sendTrainingNotification(userId: string, trainingSession: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return;

    const emailContent = `
      <h2>Formation de sensibilisation requise</h2>
      
      <p>Bonjour ${user.firstName},</p>
      
      <p>Suite à votre interaction avec notre récente simulation de phishing, une formation 
      de sensibilisation a été programmée pour vous.</p>
      
      <h3>Pourquoi cette formation?</h3>
      <p>Notre système a détecté que vous avez cliqué sur un lien dans un email de simulation. 
      Cette formation vous aidera à mieux identifier les tentatives de phishing à l'avenir.</p>
      
      <h3>Détails de la formation:</h3>
      <ul>
        <li><strong>Durée estimée:</strong> ${trainingSession.duration} minutes</li>
        <li><strong>Type:</strong> ${trainingSession.type === 'reinforced' ? 'Formation renforcée' : 'Formation standard'}</li>
        <li><strong>Date limite:</strong> ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
      </ul>
      
      <a href="${process.env.APP_URL}/training/${trainingSession.id}" 
         style="display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Commencer la formation
      </a>
      
      <p style="margin-top: 24px; color: #666; font-size: 14px;">
        Cette formation est obligatoire et fait partie de notre programme de cybersécurité.
      </p>
    `;

    await this.sendNotificationEmail(
      user.email,
      'Formation de sensibilisation au phishing requise',
      emailContent
    );
  }

  async sendReportToManagement(campaign: any, report: any) {
    const management = await this.prisma.user.findMany({
      where: {
        role: {
          name: { in: ['Admin', 'Executive'] }
        },
        active: true
      }
    });

    const riskColor = report.stats.riskScore > 70 ? '#dc2626' : 
                     report.stats.riskScore > 40 ? '#f59e0b' : '#059669';

    const emailContent = `
      <h2>Rapport de campagne: ${campaign.name}</h2>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Résumé exécutif</h3>
        <p>${report.aiAnalysis?.executiveSummary || 'Campagne de sensibilisation au phishing complétée.'}</p>
      </div>
      
      <h3>Statistiques clés</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Emails envoyés:</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${report.stats.sent}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Taux d'ouverture:</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${Math.round(report.stats.opened / report.stats.sent * 100)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Taux de clic:</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${report.stats.clickRate.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Taux de soumission:</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${report.stats.submissionRate.toFixed(1)}%</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;"><strong>Lectures rapides:</strong></td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${report.stats.fastReadRate.toFixed(1)}%</td>
        </tr>
      </table>
      
      <div style="margin: 20px 0; padding: 16px; background: ${riskColor}20; border-left: 4px solid ${riskColor};">
        <h4 style="margin: 0 0 8px 0; color: ${riskColor};">Score de risque: ${report.stats.riskScore}/100</h4>
        <p style="margin: 0;">Niveau: ${report.aiAnalysis?.riskAssessment?.level || 'Moyen'}</p>
      </div>
      
      <h3>Recommandations</h3>
      <ul>
        ${report.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
      </ul>
      
      <a href="${process.env.APP_URL}/campaigns/${campaign.id}/report" 
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">
        Voir le rapport complet
      </a>
    `;

    for (const exec of management) {
      await this.sendNotificationEmail(
        exec.email,
        `Rapport de sécurité: ${campaign.name}`,
        emailContent
      );
    }
  }

  private async sendNotificationEmail(to: string, subject: string, htmlContent: string) {
    if (process.env.SANDBOX_MODE === 'true') {
      console.log(`[SANDBOX] Would send notification to ${to}: ${subject}`);
      return;
    }

    if (!this.transporter) {
      console.warn('Cannot send notification - email service not configured');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"PhishGuard" <${process.env.SMTP_FROM || 'noreply@phishguard.local'}>`,
        to,
        subject,
        html: htmlContent
      });
    } catch (error) {
      console.error(`Failed to send notification to ${to}:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}