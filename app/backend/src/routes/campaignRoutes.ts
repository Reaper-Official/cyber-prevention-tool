import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { CampaignService } from '../services/campaignService';
import { AIProvider } from '../services/aiProvider';
import { EmailService } from '../services/emailService';
import { validateCampaignInput } from '../validators/campaignValidator';

const router = Router();
const prisma = new PrismaClient();
const campaignService = new CampaignService(prisma);
const aiProvider = new AIProvider();
const emailService = new EmailService();

router.use(authenticate);

// Récupérer toutes les campagnes
router.get('/', async (req, res, next) => {
  try {
    const campaigns = await campaignService.getAllCampaigns((req as any).user.id);
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});

// Créer une nouvelle campagne
router.post('/', authorize(['Admin', 'Manager']), validateCampaignInput, async (req, res, next) => {
  try {
    const {
      name,
      targetType, // 'department', 'specific_users', 'all'
      targetIds,
      templateType, // 'predefined', 'custom', 'ai_generated'
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
router.post('/:id/validate', authorize(['Admin', 'Validator']), async (req, res, next) => {
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

// Soumettre une campagne pour validation
router.post('/:id/submit', authorize(['Admin', 'Manager']), async (req, res, next) => {
  try {
    const campaign = await campaignService.submitForApproval(req.params.id);
    
    // Notifier les validateurs
    await emailService.notifyValidators(campaign);
    
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});

// Lancer une campagne
router.post('/:id/launch', authorize(['Admin']), async (req, res, next) => {
  try {
    const campaign = await campaignService.getCampaign(req.params.id);
    
    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (campaign.status !== 'approved') {
      throw new AppError(400, 'Campaign must be approved before launch');
    }

    // Lancer la campagne
    const launchedCampaign = await campaignService.launchCampaign(req.params.id);

    // Envoyer les emails de simulation
    if (!process.env.SANDBOX_MODE || process.env.SANDBOX_MODE === 'false') {
      await emailService.sendCampaignEmails(launchedCampaign);
    }

    res.json(launchedCampaign);
  } catch (error) {
    next(error);
  }
});

// Obtenir les statistiques d'une campagne
router.get('/:id/stats', async (req, res, next) => {
  try {
    const stats = await campaignService.getCampaignStats(req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Obtenir le rapport d'une campagne
router.get('/:id/report', async (req, res, next) => {
  try {
    const report = await campaignService.generateReport(req.params.id);
    res.json(report);
  } catch (error) {
    next(error);
  }
});

// Exporter le rapport
router.get('/:id/report/export', async (req, res, next) => {
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

// Récupérer les templates disponibles
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await campaignService.getAvailableTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// Générer un template via IA
router.post('/templates/generate', authorize(['Admin', 'Manager']), async (req, res, next) => {
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