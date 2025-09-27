import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Importer des employés depuis JSON
router.post('/employees', async (req, res, next) => {
  try {
    const { departments } = req.body;
    
    if (!departments || !Array.isArray(departments)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const results = {
      departmentsCreated: 0,
      employeesCreated: 0,
      errors: []
    };

    // Obtenir le rôle Employee par défaut
    let employeeRole = await prisma.role.findUnique({ where: { name: 'Employee' } });
    if (!employeeRole) {
      employeeRole = await prisma.role.create({
        data: { name: 'Employee', permissions: {} }
      });
    }

    for (const dept of departments) {
      try {
        // Créer ou récupérer le département
        const department = await prisma.department.upsert({
          where: { name: dept.name },
          update: {},
          create: { name: dept.name }
        });
        results.departmentsCreated++;

        // Créer les employés
        if (dept.employees && Array.isArray(dept.employees)) {
          for (const emp of dept.employees) {
            try {
              const defaultPassword = emp.password || 'ChangeMe123!';
              const hashedPassword = await bcrypt.hash(defaultPassword, 12);

              await prisma.user.upsert({
                where: { email: emp.email },
                update: {
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  position: emp.position,
                  departmentId: department.id
                },
                create: {
                  email: emp.email,
                  password: hashedPassword,
                  firstName: emp.firstName,
                  lastName: emp.lastName,
                  position: emp.position,
                  departmentId: department.id,
                  roleId: employeeRole.id
                }
              });
              results.employeesCreated++;
            } catch (empError: any) {
              results.errors.push(`Employee ${emp.email}: ${empError.message}`);
            }
          }
        }
      } catch (deptError: any) {
        results.errors.push(`Department ${dept.name}: ${deptError.message}`);
      }
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Lister tous les départements avec employés
router.get('/departments', async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            position: true,
            active: true
          }
        }
      }
    });
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// Créer des templates prédéfinis
router.post('/templates', async (req, res, next) => {
  try {
    const { name, subject, body, fromName, fromEmail, category } = req.body;
    
    const template = await prisma.template.create({
      data: { name, subject, body, fromName, fromEmail, category: category || 'general' }
    });
    
    res.status(201).json(template);
  } catch (error) {
    next(error);
  }
});

// Lister tous les templates
router.get('/templates', async (req, res, next) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

export default router;