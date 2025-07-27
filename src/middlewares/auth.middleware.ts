import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Typage du payload JWT
type JwtPayload = { userId: string; role: string; };

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    // Récupère uniquement le token depuis le cookie
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Token manquant ou invalide' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide' });
    }
}
