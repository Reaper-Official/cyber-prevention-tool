import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import { Parser } from 'json2csv';

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
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

export const getUsersByDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { department } = req.params;
    
    const users = await prisma.user.findMany({
      where: { department },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error('GetUsersByDepartment error:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
  }
};

export const importUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    let users: any[];

    if (req.file.mimetype === 'application/json') {
      users = JSON.parse(fileContent);
    } else {
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      users = lines.slice(1).filter(line => line.trim()).map(line => {
        const values = line.split(',').map(v => v.trim());
        const user: any = {};
        headers.forEach((header, index) => {
          user[header] = values[index];
        });
        return user;
      });
    }

    const imported = [];
    const errors = [];

    for (const userData of users) {
      try {
        if (!userData.email || !userData.name) {
          errors.push({ email: userData.email, error: 'Email et nom requis' });
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          errors.push({ email: userData.email, error: 'Utilisateur déjà existant' });
          continue;
        }

        const tempPassword = Math.random().toString(36).slice(-12);
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const user = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: hashedPassword,
            role: userData.role || 'EMPLOYEE',
            department: userData.department || null,
          },
        });

        imported.push({ 
          email: user.email, 
          name: user.name,
          tempPassword 
        });

      } catch (error: any) {
        errors.push({ email: userData.email, error: error.message });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'IMPORT_USERS',
        details: { imported: imported.length, errors: errors.length },
      },
    });

    res.json({
      imported,
      errors,
      summary: {
        total: users.length,
        success: imported.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    console.error('ImportUsers error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'import' });
  }
};

export const exportUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        department: true,
        createdAt: true,
      },
    });

    const parser = new Parser({
      fields: ['email', 'name', 'role', 'department', 'createdAt'],
    });

    const csv = parser.parse(users);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('ExportUsers error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'export' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, department } = req.body;

    if (role && !['ADMIN', 'HR', 'REVIEWER', 'EMPLOYEE'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { 
        ...(role && { role }),
        ...(department !== undefined && { department }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_USER',
        details: { targetUserId: id, role, department },
      },
    });

    res.json(user);
  } catch (error) {
    console.error('UpdateUserRole error:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
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