import { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../validation/auth.validation'; // à créer/adapter

export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: "Données invalides",
            details: error.details.map((d) => d.message)
        });
    }
    next();
}
