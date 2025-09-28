import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

// Import CSV d'utilisateurs
router.post('/users', authorize(['Admin']), upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results: any[] = [];
  const errors: any[] = [];
  let imported = 0;

  try {
    // Parse CSV
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        // Process each row
        for (const row of results) {
          try {
            const department = await prisma.department.findFirst({
              where: { name: row.department }
            });

            const role = await prisma.role.findFirst({
              where: { name: row.role || 'Employee' }
            });

            if (!role) {
              errors.push({ row, error: 'Role not found' });
              continue;
            }

            // Create or update user
            await prisma.user.upsert({
              where: { email: row.email },
              update: {
                firstName: row.firstName,
                lastName: row.lastName,
                departmentId: department?.id
              },
              create: {
                email: row.email,
                password: '$2a$12$default.password.hash', // Default password
                firstName: row.firstName,
                lastName: row.lastName,
                departmentId: department?.id,
                roleId: role.id,
                active: true
              }
            });
            
            imported++;
          } catch (error) {
            errors.push({ row, error });
          }
        }

        // Clean up file
        fs.unlinkSync(req.file!.path);

        res.json({
          success: true,
          imported,
          total: results.length,
          errors: errors.length,
          errorDetails: errors
        });
      });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
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

    // Convert to CSV (simplified)
    const headers = Object.keys(csvData[0]).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    const csv = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;