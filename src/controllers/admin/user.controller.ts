// controllers/admin/user.controller.ts

import { Request, Response } from 'express';
import User from '../../models/user.model';
import AuditLog from '../../models/audit.model';

// GET /admin/users?limit=20&page=1
export async function getAllUsers(req: Request, res: Response) {
    // Pagination basique (optionnel)
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100)); // 1-100
    const page = Math.max(1, Number(req.query.page) || 1);

    // (Optionnel) Filtres
    const role = req.query.role as string | undefined;
    const isActive = req.query.isActive as string | undefined;

    // Build query object
    const query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    try {
        // Pas de password dans la réponse !
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err: any) {
        res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: err.message });
    }
}

// PATCH /admin/users/:userId/ban
export async function banUser(req: Request, res: Response) {
    const { userId } = req.params;

    // Vérifie que l'admin ne se bannit pas lui-même (optionnel mais conseillé)
    if (req.user?.userId === userId) {
        return res.status(400).json({ message: "Impossible de se bannir soi-même." });
    }

    try {
        // Met à jour le flag isActive
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        // Audit : log l'action
        await AuditLog.create({
            userId: req.user?.userId,
            action: 'ban_user',
            target: 'User',
            targetId: userId,
            details: {
                bannedUser: user.email,
                by: req.user?.userId,
                ip: req.ip
            }
        });

        res.json({ message: "Utilisateur désactivé", user });
    } catch (err: any) {
        res.status(500).json({ message: "Erreur lors de la désactivation", error: err.message });
    }
}

// PATCH /admin/users/:userId/unban
export async function unbanUser(req: Request, res: Response) {
    const { userId } = req.params;

    // On évite de s’unban soi-même (optionnel)
    if (req.user?.userId === userId) {
        return res.status(400).json({ message: "Impossible de se réactiver soi-même." });
    }

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
        if (user.isActive !== true) {
            return res.status(400).json({ message: "L'utilisateur est déjà actif." });
        }

        // Audit trail : loggue l’action
        await AuditLog.create({
            userId: req.user?.userId,
            action: 'unban_user',
            target: 'User',
            targetId: userId,
            details: {
                unbannedUser: user.email,
                by: req.user?.userId,
                ip: req.ip
            }
        });

        res.json({ message: "Utilisateur réactivé", user });
    } catch (err: any) {
        res.status(500).json({ message: "Erreur lors de la réactivation", error: err.message });
    }
}