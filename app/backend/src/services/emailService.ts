import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (config.smtpHost && config.smtpUser && config.smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
      });
    }
  }

  async sendPhishingEmail(
    to: string,
    subject: string,
    body: string,
    targetId: string,
    campaignId: string
  ) {
    if (!this.transporter) {
      console.warn('SMTP not configured, skipping email send');
      return;
    }

    const trackingPixel = `<img src="${config.frontendUrl}/api/track/open?targetId=${targetId}&campaignId=${campaignId}" width="1" height="1" />`;
    const trackingLink = `${config.frontendUrl}/api/track/click?targetId=${targetId}&campaignId=${campaignId}`;

    const htmlBody = body
      .replace(/href="([^"]*)"/g, `href="${trackingLink}&redirect=$1"`)
      .concat(trackingPixel);

    await this.transporter.sendMail({
      from: config.smtpFrom,
      to,
      subject,
      html: htmlBody,
    });
  }
}