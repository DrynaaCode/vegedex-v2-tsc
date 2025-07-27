// middlewares/hasRoleDb.ts
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

// Vérifie que l'utilisateur a (au moins) un des rôles demandés
export function hasRole(...roles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ message: "Non authentifié" });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });
        if (!roles.includes(user.role)) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        next();
    };
}
