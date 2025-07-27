import { Router } from 'express';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { getMe, updateMe, updateSettings } from '../controllers/user.controller';
import { hasRole } from '../middlewares/hasRole';
import { ensureActive } from '../middlewares/ensureActive';

const router = Router();

router.get('/me', authenticateJWT, ensureActive,getMe);
router.patch('/me', authenticateJWT,ensureActive, updateMe);
router.patch('/settings', authenticateJWT, updateSettings);



export default router;
