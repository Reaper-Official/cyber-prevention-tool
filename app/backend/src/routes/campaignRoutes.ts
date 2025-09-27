import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Liste toutes les campagnes
router.get('/', async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { 
        createdBy: { select: { email: true, firstName: true } }, 
        _count: { select: { targets: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// Créer une campagne
router.post('/', async (req, res, next) => {
  try {
    const { name, subject, body, fromName, fromEmail, targetUserIds } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name, subject, body, fromName, fromEmail, 
        sandbox: true,
        status: 'draft',
        createdById: (req as any).user.id,
        targets: { 
          create: (targetUserIds || []).map((userId: string) => ({ 
            userId, 
            status: 'pending',
            trackingId: require('crypto').randomUUID()
          })) 
        }
      },
      include: { targets: true, _count: { select: { targets: true } } }
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// Détails d'une campagne avec stats
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { 
        targets: { 
          include: { 
            user: { 
              select: { email: true, firstName: true, lastName: true } 
            } 
          } 
        }, 
        createdBy: { 
          select: { email: true, firstName: true } 
        } 
      }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    
    // Calculer les statistiques
    const clickCount = campaign.targets.filter(t => t.status === 'clicked').length;
    const openCount = campaign.targets.filter(t => ['opened', 'clicked'].includes(t.status)).length;
    
    const stats = {
      total: campaign.targets.length,
      pending: campaign.targets.filter(t => t.status === 'pending').length,
      sent: campaign.targets.filter(t => t.status === 'sent').length,
      opened: openCount,
      clicked: clickCount,
      clickRate: campaign.targets.length > 0 
        ? ((clickCount / campaign.targets.length) * 100).toFixed(1)
        : '0',
      openRate: campaign.targets.length > 0
        ? ((openCount / campaign.targets.length) * 100).toFixed(1)
        : '0'
    };
    
    res.json({ ...campaign, stats });
  } catch (error) {
    next(error);
  }
});

// Lancer une campagne
router.post('/:id/launch', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { targets: true }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    if (campaign.status !== 'draft') throw new AppError(400, 'Campaign already launched');
    if (campaign.targets.length === 0) throw new AppError(400, 'No targets defined');
    
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { 
        status: 'published',
        publishedAt: new Date()
      }
    });
    
    await prisma.campaignTarget.updateMany({
      where: { campaignId: req.params.id },
      data: { status: 'sent' }
    });
    
    res.json({ 
      ...updated, 
      message: `Campaign launched successfully. ${campaign.targets.length} emails sent.` 
    });
  } catch (error) {
    next(error);
  }
});

// Tracking - Ouverture d'email
router.get('/track/open/:trackingId', async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    
    await prisma.campaignTarget.updateMany({
      where: { 
        trackingId,
        status: 'sent'
      },
      data: { 
        status: 'opened',
        openedAt: new Date()
      }
    });
    
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.type('image/gif').send(pixel);
  } catch (error) {
    res.type('image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
});

// Tracking - Clic sur lien
router.get('/track/click/:trackingId', async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    
    await prisma.campaignTarget.update({
      where: { trackingId },
      data: { 
        status: 'clicked',
        clickedAt: new Date()
      }
    });
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Security Awareness Training</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .warning { background: #fef3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; }
          h1 { color: #d63031; }
          .info { background: #e8f4f8; padding: 15px; border-radius: 8px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="warning">
          <h1>⚠️ This was a simulated phishing attack</h1>
          <p>You clicked on a link in a simulated phishing email. In a real attack, this could have compromised your data.</p>
        </div>
        <div class="info">
          <h3>What to look for:</h3>
          <ul>
            <li>Verify sender email addresses carefully</li>
            <li>Hover over links before clicking</li>
            <li>Be suspicious of urgent requests</li>
            <li>Report suspicious emails to IT</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

// Rapport détaillé
router.get('/:id/report', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: {
        targets: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true }
            }
          }
        },
        createdBy: {
          select: { email: true, firstName: true }
        }
      }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    
    const clickCount = campaign.targets.filter(t => t.status === 'clicked').length;
    const clickRateNum = campaign.targets.length > 0 ? (clickCount / campaign.targets.length) * 100 : 0;
    
    const stats = {
      total: campaign.targets.length,
      pending: campaign.targets.filter(t => t.status === 'pending').length,
      sent: campaign.targets.filter(t => t.status === 'sent').length,
      opened: campaign.targets.filter(t => t.status === 'opened').length,
      clicked: clickCount,
      clickRate: clickRateNum.toFixed(1),
      openRate: campaign.targets.length > 0
        ? ((campaign.targets.filter(t => ['opened', 'clicked'].includes(t.status)).length / campaign.targets.length) * 100).toFixed(1)
        : '0'
    };
    
    const targetsByStatus = {
      pending: campaign.targets.filter(t => t.status === 'pending'),
      sent: campaign.targets.filter(t => t.status === 'sent'),
      opened: campaign.targets.filter(t => t.status === 'opened'),
      clicked: campaign.targets.filter(t => t.status === 'clicked')
    };
    
    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        publishedAt: campaign.publishedAt,
        createdBy: campaign.createdBy
      },
      stats,
      targetsByStatus,
      recommendations: clickRateNum > 20 ? [
        'Click rate is high - consider additional training',
        'Review email templates for suspicious indicators',
        'Schedule follow-up training sessions'
      ] : [
        'Good awareness level maintained',
        'Continue regular training exercises'
      ]
    });
  } catch (error) {
    next(error);
  }
});

// Supprimer une campagne
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.campaign.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;