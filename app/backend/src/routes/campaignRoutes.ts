import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);
router.get('/', async (req, res, next) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { createdBy: { select: { email: true } }, _count: { select: { targets: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
});
router.post('/', async (req, res, next) => {
  try {
    const { name, subject, body, fromName, fromEmail, targetUserIds } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        name, subject, body, fromName, fromEmail, sandbox: true, createdById: (req as any).user.id,
        targets: { create: (targetUserIds || []).map((userId: string) => ({ userId, status: 'pending' })) }
      }
    });
    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { targets: { include: { user: true } }, createdBy: true }
    });
    if (!campaign) throw new AppError(404, 'Not found');
    res.json(campaign);
  } catch (error) {
    next(error);
  }
});
export default router;
