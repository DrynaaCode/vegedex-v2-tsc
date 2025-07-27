import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import plantRoutes from './routes/plant.routes';

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
app.use(cookieParser());

// Routes
app.get('/', (_, res) => res.send('Hello Plant API!'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/plants', plantRoutes);


// Routes admin (à ajouter si tu as des routes admin)
app.use('/api/admin', adminRoutes); 



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
