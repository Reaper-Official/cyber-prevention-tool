import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
const router = Router();
const prisma = new PrismaClient();
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
    if (!user || !user.active) throw new AppError(401, 'Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError(401, 'Invalid credentials');
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role.name } });
  } catch (error) {
    next(error);
  }
});
export default router;
