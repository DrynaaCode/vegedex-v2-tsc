import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

// Sécurité de base
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));

// Rate limiter global (tu peux personnaliser)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (_, res) => res.send('Hello Plant API!'));
app.use('/api/auth', authRoutes);

// Gestion d'erreur JSON mal formé
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON invalide (erreur de syntaxe)' });
  }
  next(err);
});

// Gestion d’erreur globale (optionnel, mais pro)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({ message: 'Erreur serveur.' });
});

export default app;
