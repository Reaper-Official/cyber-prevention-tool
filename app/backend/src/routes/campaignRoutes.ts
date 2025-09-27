import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Liste des campagnes
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
    const { name, subject, body, fromName, fromEmail, targetUserIds, templateType } = req.body;
    
    const campaign = await prisma.campaign.create({
      data: {
        name, 
        subject, 
        body, 
        fromName, 
        fromEmail, 
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
      include: { targets: true }
    });
    
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// Détails d'une campagne
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
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// Publier une campagne (validation requise)
router.post('/:id/publish', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    if (campaign.status !== 'draft') throw new AppError(400, 'Campaign already published');
    
    const updated = await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: 'published' }
    });
    
    // TODO: Déclencher l'envoi des emails ici
    
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Tracking - Enregistrer l'ouverture d'un email
router.get('/track/open/:trackingId', async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    
    await prisma.campaignTarget.update({
      where: { trackingId },
      data: { 
        status: 'opened',
        openedAt: new Date()
      }
    });
    
    // Retourner un pixel transparent 1x1
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.type('image/gif').send(pixel);
  } catch (error) {
    next(error);
  }
});

// Tracking - Enregistrer le clic sur un lien
router.get('/track/click/:trackingId', async (req, res, next) => {
  try {
    const { trackingId } = req.params;
    
    const target = await prisma.campaignTarget.update({
      where: { trackingId },
      data: { 
        status: 'clicked',
        clickedAt: new Date()
      },
      include: { campaign: true }
    });
    
    // Rediriger vers la page de formation
    res.redirect(`/training/${trackingId}`);
  } catch (error) {
    next(error);
  }
});

// Rapport de campagne
router.get('/:id/report', async (req, res, next) => {
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
        }
      }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    
    const stats = {
      total: campaign.targets.length,
      sent: campaign.targets.filter(t => t.status !== 'pending').length,
      opened: campaign.targets.filter(t => t.status === 'opened' || t.status === 'clicked').length,
      clicked: campaign.targets.filter(t => t.status === 'clicked').length,
      clickRate: campaign.targets.length > 0 
        ? (campaign.targets.filter(t => t.status === 'clicked').length / campaign.targets.length * 100).toFixed(2)
        : 0
    };
    
    res.json({
      campaign,
      stats,
      targets: campaign.targets
    });
  } catch (error) {
    next(error);
  }
});

export default router;