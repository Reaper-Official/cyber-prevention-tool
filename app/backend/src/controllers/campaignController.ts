import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { CampaignService } from '../services/campaignService.js';

const campaignService = new CampaignService();

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { name, templateId, targetDepartments, sandboxMode, scheduledFor } = req.body;

    if (!name || !templateId || !targetDepartments || targetDepartments.length === 0) {
      return res.status(400).json({ message: 'Nom, template et départements requis' });
    }

    // Récupérer le template
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }

    // Récupérer les utilisateurs des départements ciblés
    const users = await prisma.user.findMany({
      where: {
        department: { in: targetDepartments },
      },
    });

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject: template.subject,
        body: template.body,
        templateId,
        targetDepartments,
        sandboxMode: sandboxMode ?? true,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: 'DRAFT',
        createdById: req.user!.id,
        targets: {
          create: users.map((user) => ({
            email: user.email,
            userId: user.id,
            status: 'PENDING',
          })),
        },
      },
      include: {
        targets: true,
        _count: {
          select: { targets: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_CAMPAIGN',
        details: { campaignId: campaign.id, name },
      },
    });

    res.status(201).json(campaign);
  } catch (error) {
    console.error('CreateCampaign error:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la campagne' });
  }
};

export const getCampaigns = async (_req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { targets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(campaigns);
  } catch (error) {
    console.error('GetCampaigns error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes' });
  }
};

export const getCampaignById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        targets: true,
      },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campagne non trouvée' });
    }

    res.json(campaign);
  } catch (error) {
    console.error('GetCampaignById error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
  }
};

export const getCampaignStats = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const stats = await campaignService.calculateCampaignStats(id);
    res.json(stats);
  } catch (error) {
    console.error('GetCampaignStats error:', error);
    res.status(500).json({ message: 'Erreur' });
  }
};

export const validateCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'APPROVED',
        validatedById: req.user!.id,
        validatedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'VALIDATE_CAMPAIGN',
        details: { campaignId: id },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('ValidateCampaign error:', error);
    res.status(500).json({ message: 'Erreur lors de la validation' });
  }
};

export const publishCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PUBLISH_CAMPAIGN',
        details: { campaignId: id },
      },
    });

    res.json(campaign);
  } catch (error) {
    console.error('PublishCampaign error:', error);
    res.status(500).json({ message: 'Erreur lors de la publication' });
  }
};