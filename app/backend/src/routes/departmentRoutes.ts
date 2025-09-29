import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all departments
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    
    const departmentsWithCount = departments.map(dept => ({
      ...dept,
      userCount: dept._count.users
    }));
    
    res.json(departmentsWithCount);
  } catch (error) {
    next(error);
  }
});

// Create department
router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, riskLevel } = req.body;
    
    const department = await prisma.department.create({
      data: {
        name,
        description,
        riskLevel: riskLevel || 'medium'
      }
    });
    
    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
});

// Update department
router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, riskLevel } = req.body;
    
    const department = await prisma.department.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        riskLevel
      }
    });
    
    res.json(department);
  } catch (error) {
    next(error);
  }
});

// Delete department
router.delete('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.department.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;