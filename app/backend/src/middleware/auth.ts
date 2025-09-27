import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';
const prisma = new PrismaClient();
export interface AuthRequest extends Request {
  user?: any;
}
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new AppError(401, 'Auth required');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { role: true } });
    if (!user || !user.active) throw new AppError(401, 'Invalid');
    req.user = { id: user.id, email: user.email, role: user.role.name };
    next();
  } catch (error) {
    next(new AppError(401, 'Invalid token'));
  }
};
