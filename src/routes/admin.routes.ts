// routes/admin.routes.ts
import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { hasRole } from '../middlewares/hasRole';
import { banUser, getAllUsers, unbanUser } from '../controllers/admin/user.controller';

const router = Router();

router.get('/user', authenticateJWT, hasRole('admin'), getAllUsers);
router.patch('/user/:userId/ban',authenticateJWT,hasRole('admin', 'moderator'), banUser);
router.patch('/user/:userId/unban',authenticateJWT,hasRole('admin', 'moderator'),unbanUser);
export default router;
