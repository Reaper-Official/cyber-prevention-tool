import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Import CSV d'utilisateurs simplifié (sans multer pour éviter les erreurs de type)
router.post('/users/csv', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { users } = req.body; // Attendez un tableau d'utilisateurs dans le body
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    let imported = 0;
    const errors: any[] = [];

    for (const userData of users) {
      try {
        const department = await prisma.department.findFirst({
          where: { name: userData.department }
        });

        const role = await prisma.role.findFirst({
          where: { name: userData.role || 'Employee' }
        });

        if (!role) {
          errors.push({ user: userData, error: 'Role not found' });
          continue;
        }

        await prisma.user.upsert({
          where: { email: userData.email },
          update: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            departmentId: department?.id
          },
          create: {
            email: userData.email,
            password: '$2a$12$default.password.hash',
            firstName: userData.firstName,
            lastName: userData.lastName,
            departmentId: department?.id,
            roleId: role.id,
            active: true
          }
        });
        
        imported++;
      } catch (error) {
        errors.push({ user: userData, error });
      }
    }

    res.json({
      success: true,
      imported,
      total: users.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    next(error);
  }
});

// Export users to CSV
router.get('/users/export', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
        role: true
      }
    });

    const csvData = users.map(u => ({
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      department: u.department?.name,
      role: u.role.name,
      active: u.active
    }));

    // Convert to CSV
    const headers = ['email', 'firstName', 'lastName', 'department', 'role', 'active'];
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = (row as any)[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;