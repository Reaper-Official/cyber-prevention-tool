import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['ADMIN', 'HR', 'REVIEWER', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_USER_ROLE',
        details: { targetUserId: id, newRole: role },
      },
    });

    res.json(user);
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du rôle' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.update({
      where: { id },
      data: {
        email: `deleted_${Date.now()}@deleted.local`,
        name: 'Utilisateur supprimé',
        password: '',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_USER',
        details: { targetUserId: id },
      },
    });

    res.json({ message: 'Utilisateur anonymisé avec succès' });
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
};