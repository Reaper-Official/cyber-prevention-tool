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
        _count: { select: { targets: true } },
        template: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// Créer une campagne avec ciblage par département
router.post('/', async (req, res, next) => {
  try {
    const { 
      name, subject, body, fromName, fromEmail, 
      templateId, targetType, targetDepartmentIds, targetUserIds 
    } = req.body;
    
    let targets = [];
    
    if (targetType === 'all') {
      const allUsers = await prisma.user.findMany({
        where: { active: true, role: { name: { not: 'Admin' } } }
      });
      targets = allUsers.map(u => u.id);
    } else if (targetType === 'departments' && targetDepartmentIds) {
      const deptUsers = await prisma.user.findMany({
        where: { 
          departmentId: { in: targetDepartmentIds },
          active: true 
        }
      });
      targets = deptUsers.map(u => u.id);
    } else if (targetType === 'specific' && targetUserIds) {
      targets = targetUserIds;
    }
    
    const campaign = await prisma.campaign.create({
      data: {
        name, subject, body, fromName, fromEmail,
        templateId,
        sandbox: true,
        status: 'draft',
        createdById: (req as any).user.id,
        targets: { 
          create: targets.map((userId: string) => ({ 
            userId, 
            status: 'pending',
            trackingId: require('crypto').randomUUID()
          })) 
        }
      },
      include: { 
        targets: { include: { user: { select: { firstName: true, lastName: true, email: true, department: true } } } },
        _count: { select: { targets: true } } 
      }
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
              select: { email: true, firstName: true, lastName: true, position: true, department: { select: { name: true } } } 
            } 
          } 
        }, 
        createdBy: { select: { email: true, firstName: true } },
        template: true
      }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    
    const clickCount = campaign.targets.filter(t => t.status === 'clicked').length;
    const openCount = campaign.targets.filter(t => ['opened', 'clicked'].includes(t.status)).length;
    
    const stats = {
      total: campaign.targets.length,
      pending: campaign.targets.filter(t => t.status === 'pending').length,
      sent: campaign.targets.filter(t => t.status === 'sent').length,
      opened: openCount,
      clicked: clickCount,
      clickRate: campaign.targets.length > 0 ? ((clickCount / campaign.targets.length) * 100).toFixed(1) : '0',
      openRate: campaign.targets.length > 0 ? ((openCount / campaign.targets.length) * 100).toFixed(1) : '0'
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
    
    await prisma.campaign.update({
      where: { id: req.params.id },
      data: { status: 'published', publishedAt: new Date() }
    });
    
    await prisma.campaignTarget.updateMany({
      where: { campaignId: req.params.id },
      data: { status: 'sent' }
    });
    
    res.json({ message: `Campaign launched. ${campaign.targets.length} emails sent.` });
  } catch (error) {
    next(error);
  }
});

// Tracking - Ouverture
router.get('/track/open/:trackingId', async (req, res, next) => {
  try {
    await prisma.campaignTarget.updateMany({
      where: { trackingId: req.params.trackingId, status: 'sent' },
      data: { status: 'opened', openedAt: new Date() }
    });
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.type('image/gif').send(pixel);
  } catch (error) {
    res.type('image/gif').send(Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));
  }
});

// Tracking - Clic avec page de formation
router.get('/track/click/:trackingId', async (req, res, next) => {
  try {
    await prisma.campaignTarget.update({
      where: { trackingId: req.params.trackingId },
      data: { status: 'clicked', clickedAt: new Date() }
    });
    
    res.send(`<!DOCTYPE html><html><head><title>Security Training</title><style>body{font-family:sans-serif;max-width:600px;margin:50px auto;padding:20px}.warning{background:#fef3cd;padding:20px;border-radius:8px}h1{color:#d63031}.info{background:#e8f4f8;padding:15px;border-radius:8px;margin-top:20px}</style></head><body><div class="warning"><h1>⚠️ Simulated Phishing Attack</h1><p>This was a training exercise. In a real attack, clicking this link could compromise your data.</p></div><div class="info"><h3>Security Tips:</h3><ul><li>Verify sender addresses</li><li>Hover over links before clicking</li><li>Be suspicious of urgent requests</li><li>Report suspicious emails to IT</li></ul></div></body></html>`);
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
        targets: { include: { user: { select: { email: true, firstName: true, lastName: true, position: true, department: { select: { name: true } } } } } },
        createdBy: { select: { email: true, firstName: true } }
      }
    });
    
    if (!campaign) throw new AppError(404, 'Campaign not found');
    
    const clickCount = campaign.targets.filter(t => t.status === 'clicked').length;
    const clickRateNum = campaign.targets.length > 0 ? (clickCount / campaign.targets.length) * 100 : 0;
    
    // Stats par département
    const deptStats: any = {};
    campaign.targets.forEach(t => {
      const deptName = t.user.department?.name || 'No Department';
      if (!deptStats[deptName]) deptStats[deptName] = { total: 0, clicked: 0 };
      deptStats[deptName].total++;
      if (t.status === 'clicked') deptStats[deptName].clicked++;
    });
    
    res.json({
      campaign: { id: campaign.id, name: campaign.name, status: campaign.status },
      stats: {
        total: campaign.targets.length,
        clicked: clickCount,
        clickRate: clickRateNum.toFixed(1)
      },
      departmentStats: deptStats,
      recommendations: clickRateNum > 20 ? ['High click rate - additional training needed'] : ['Good awareness level']
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;