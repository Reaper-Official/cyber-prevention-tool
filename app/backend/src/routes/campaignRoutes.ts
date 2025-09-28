import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CampaignService } from '../services/campaignService';
import { AIProvider } from '../services/aiProvider';
import { EmailService } from '../services/emailService';

const router = Router();
const prisma = new PrismaClient();
const campaignService = new CampaignService(prisma);
const aiProvider = new AIProvider();
const emailService = new EmailService();

router.use(authenticate);

// Récupérer toutes les campagnes
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaigns = await campaignService.getAllCampaigns((req as any).user.id);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// Créer une nouvelle campagne
router.post('/', authorize(['Admin', 'Manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      targetType,
      targetIds,
      templateType,
      templateId,
      customTemplate,
      aiPrompt,
      scheduledAt
    } = req.body;

    // Créer la campagne en mode brouillon
    const campaign = await campaignService.createCampaign({
      name,
      targetType,
      targetIds,
      createdById: (req as any).user.id,
      status: 'draft'
    });

    // Gérer le template selon le type
    let template;
    if (templateType === 'predefined') {
      template = await campaignService.getTemplate(templateId);
    } else if (templateType === 'custom') {
      template = customTemplate;
    } else if (templateType === 'ai_generated') {
      // Générer le template via IA
      const targets = await campaignService.getTargetUsers(targetType, targetIds);
      template = await aiProvider.generateCampaignTemplate({
        prompt: aiPrompt,
        targetProfiles: targets,
        campaignName: name
      });
    }

    // Mettre à jour la campagne avec le template
    await campaignService.updateCampaignTemplate(campaign.id, template);

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});

// Valider une campagne (RH/Sécurité)
router.post('/:id/validate', authorize(['Admin', 'Validator']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { approved, comments } = req.body;
    
    const campaign = await campaignService.getCampaign(req.params.id);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'pending_approval') {
      throw new AppError(400, 'Campaign is not pending approval');
    }

    const updatedCampaign = await campaignService.validateCampaign(
      req.params.id,
      (req as any).user.id,
      approved,
      comments
    );

    res.json(updatedCampaign);
  } catch (error) {
    next(error);
  }
});

// Les autres routes...
router.post('/:id/submit', authorize(['Admin', 'Manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.submitForApproval(req.params.id);
    await emailService.notifyValidators(campaign);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/launch', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const campaign = await campaignService.getCampaign(req.params.id);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'approved') {
      throw new AppError(400, 'Campaign must be approved before launch');
    }

    const launchedCampaign = await campaignService.launchCampaign(req.params.id);

    if (!process.env.SANDBOX_MODE || process.env.SANDBOX_MODE === 'false') {
      await emailService.sendCampaignEmails(launchedCampaign);
    }

    res.json(launchedCampaign);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await campaignService.getCampaignStats(req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/report', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await campaignService.generateReport(req.params.id);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/report/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const format = req.query.format as string || 'pdf';
    const report = await campaignService.exportReport(req.params.id, format);
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=campaign-report-${req.params.id}.${format}`);
    res.send(report);
  } catch (error) {
    next(error);
  }
});

router.get('/templates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await campaignService.getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

router.post('/templates/generate', authorize(['Admin', 'Manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, targetDepartment, targetRoles } = req.body;
    
    const template = await aiProvider.generateCampaignTemplate({
      prompt,
      targetProfiles: { department: targetDepartment, roles: targetRoles },
      campaignName: req.body.campaignName
    });

    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;