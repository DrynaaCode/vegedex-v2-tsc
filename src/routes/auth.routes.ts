// routes/auth.routes.ts
import { Router } from 'express';
import { forgotPassword, login, logout, refreshToken, register, resetPassword } from '../controllers/auth.controller';
import { validateLogin } from '../middlewares/validateLogin';

const router = Router();

router.post('/register', register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/refresh-token', refreshToken);

export default router;
