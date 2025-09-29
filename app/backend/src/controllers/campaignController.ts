import { Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { CampaignService } from '../services/campaignService.js';

const campaignService = new CampaignService();

export const createCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, subject, body, targets, sandboxMode } = req.body;

    const campaign = await prisma.campaign.create({
      data: {
        name,
        subject,
        body,
        sandboxMode,
        status: 'DRAFT',
        createdById: req.user!.id,
        targets: {
          create: targets.map((email: string) => ({
            email,
            status: 'PENDING',
          })),
        },
      },
      include: {
        targets: true,
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

export const getCampaigns = async (req: AuthRequest, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        _count: {
          select: { targets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const stats = await campaignService.calculateCampaignStats(campaign.id);
        return {
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          createdAt: campaign.createdAt,
          targetCount: campaign._count.targets,
          clickRate: stats.clickRate,
        };
      })
    );

    res.json(campaignsWithStats);
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

    const report = await campaignService.generateCampaignReport(id);

    res.json({
      ...campaign,
      report,
      targets: campaign.targets,
    });
  } catch (error) {
    console.error('GetCampaignById error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la campagne' });
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
    res.status(500).json({ message: 'Erreur lors de la validation de la campagne' });
  }
};

export const publishCampaign = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { targets: true },
    });

    if (!campaign) {
      return res.status(404).json({ message: 'Campagne non trouvée' });
    }

    if (campaign.status !== 'APPROVED') {
      return res.status(400).json({ message: 'La campagne doit être approuvée avant publication' });
    }

    await campaignService.publishCampaign(id);

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'PUBLISH_CAMPAIGN',
        details: { campaignId: id, sandboxMode: campaign.sandboxMode },
      },
    });

    res.json({ message: 'Campagne publiée avec succès' });
  } catch (error) {
    console.error('PublishCampaign error:', error);
    res.status(500).json({ message: 'Erreur lors de la publication de la campagne' });
  }
};