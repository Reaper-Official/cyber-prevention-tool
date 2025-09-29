import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'HR'), getUsers);
router.put('/:id/role', authenticate, authorize('ADMIN'), updateUserRole);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;