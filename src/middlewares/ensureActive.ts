import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

// À placer APRES authenticateJWT dans les routes protégées
export async function ensureActive(req: Request, res: Response, next: NextFunction) {
    if (!req.user?.userId) return res.status(401).json({ message: "Non authentifié" });

    // Toujours vérifier le user en base
    const user = await User.findById(req.user.userId);
    if (!user || !user.isActive) {
        // Optionnel : Audit log de l'accès refusé ici si tu veux
        return res.status(401).json({ message: "Compte désactivé. Contacte le support." });
    }
    // Met à jour dynamiquement le rôle du user si besoin (anti-"fake admin")
    req.user.role = user.role;
    next();
}
