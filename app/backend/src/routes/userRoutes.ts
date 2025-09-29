import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Get all users
router.get('/', authorize(['Admin', 'Manager']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        department: true,
        role: true,
        active: true,
        securityLevel: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        role: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, departmentId, roleId } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'ChangeMe123!', 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        departmentId,
        roleId,
        active: true
      }
    });
    
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Update user
router.put('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, firstName, lastName, departmentId, roleId, active } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email,
        firstName,
        lastName,
        departmentId,
        roleId,
        active
      }
    });
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Delete user (soft delete)
router.delete('/:id', authorize(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { active: false }
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;