import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const getTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const { category, difficulty } = req.query;

    const templates = await prisma.emailTemplate.findMany({
      where: {
        active: true,
        ...(category && { category: category as string }),
        ...(difficulty && { difficulty: difficulty as string }),
      },
      orderBy: { usageCount: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('GetTemplates error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des templates' });
  }
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }

    res.json(template);
  } catch (error) {
    console.error('GetTemplate error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du template' });
  }
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, difficulty, subject, body, description, indicators } = req.body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        category,
        difficulty,
        subject,
        body,
        description,
        indicators,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_TEMPLATE',
        details: { templateId: template.id, name },
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('CreateTemplate error:', error);
    res.status(500).json({ message: 'Erreur lors de la création du template' });
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, category, difficulty, subject, body, description, indicators, active } = req.body;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name,
        category,
        difficulty,
        subject,
        body,
        description,
        indicators,
        active,
      },
    });

    res.json(template);
  } catch (error) {
    console.error('UpdateTemplate error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du template' });
  }
};

export const useTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 },
      },
    });

    res.json(template);
  } catch (error) {
    console.error('UseTemplate error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'utilisation du template' });
  }
};