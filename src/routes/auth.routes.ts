// routes/auth.routes.ts
import { Router } from 'express';
import { forgotPassword, login, logout, register, resetPassword } from '../controllers/auth.controller';
import { validateLogin } from '../middlewares/validateLogin';

const router = Router();

router.post('/register', register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
export default router;
