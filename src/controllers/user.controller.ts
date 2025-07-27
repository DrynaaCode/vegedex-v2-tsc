import { Request, Response } from 'express';
import User from '../models/user.model';
import { updateMeSchema } from '../validation/user.validation';

// GET /me
export async function getMe(req: Request, res: Response) {
    if (!req.user?.userId) {
        return res.status(401).json({ message: "Non authentifié" });
    }

    const userId = req.user.userId; // TypeScript n'avertit plus après la vérif

    const user = await User.findById(userId).select('-password');
    if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    });
}

// PATCH /me
export async function updateMe(req: Request, res: Response) {
    if (!req.user?.userId) {
        return res.status(401).json({ message: "Non authentifié" });
    }

    // Validation avec Joi
    const { error, value } = updateMeSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
        return res.status(400).json({
            message: "Données invalides",
            details: error.details.map(d => d.message)
        });
    }

    const userId = req.user.userId;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: value },
            { new: true, runValidators: true, context: 'query' }
        ).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        res.json({
            username: user.username,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            bio: user.bio,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
    } catch (err: any) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
}
