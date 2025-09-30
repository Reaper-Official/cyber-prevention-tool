import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, read: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('GetNotifications error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.notification.update({
      where: { id, userId: req.user!.id },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('MarkAsRead error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, read: false },
      data: { read: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('MarkAllAsRead error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
};