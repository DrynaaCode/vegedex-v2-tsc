// src/middlewares/optionalAuth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Typage du payload JWT, vous pouvez le réutiliser
type JwtPayload = { userId: string; role: string; };

/**
 * Ce middleware tente d'authentifier l'utilisateur via le cookie JWT.
 * S'il y a un token valide, il attache `req.user`.
 * S'il n'y a pas de token, il passe simplement à la suite sans erreur.
 * S'il y a un token mais qu'il est invalide, il renvoie une erreur 401.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.token;

    // Pas de token, l'utilisateur est un invité. On continue.
    if (!token) {
        return next();
    }

    try {
        // Un token est présent, on le vérifie
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded; // On attache les infos de l'utilisateur à la requête
        next();
    } catch (err) {
        // Le token est présent mais invalide (expiré, malformé...)
        // C'est une erreur car l'utilisateur essaie de s'authentifier mais échoue.
        return res.status(401).json({ message: 'Token invalide' });
    }
}