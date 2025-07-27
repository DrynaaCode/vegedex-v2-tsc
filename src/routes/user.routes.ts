import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { getMe, updateMe } from '../controllers/user.controller';
import { hasRole } from '../middlewares/hasRole';

const router = Router();

router.get('/me', authenticateJWT, getMe);
router.patch('/me', authenticateJWT, updateMe);



export default router;
