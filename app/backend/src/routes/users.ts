import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  getUsers, 
  updateUserRole, 
  deleteUser,
  importUsers,
  exportUsers,
  getUsersByDepartment 
} from '../controllers/userController.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, authorize('ADMIN', 'HR'), getUsers);
router.get('/department/:department', authenticate, authorize('ADMIN', 'HR'), getUsersByDepartment);
router.post('/import', authenticate, authorize('ADMIN', 'HR'), upload.single('file'), importUsers);
router.get('/export', authenticate, authorize('ADMIN', 'HR'), exportUsers);
router.put('/:id/role', authenticate, authorize('ADMIN'), updateUserRole);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;