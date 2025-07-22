import { Router } from 'express';
import User from '../models/user.model';
import { registerSchema } from '../validation/auth.validation';
import AuditLog from '../models/audit.model'; 

const router = Router();

router.post('/register', async (req, res) => {
    try {
        // 1. Validation Joi
        const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                message: "Données invalides",
                details: error.details.map((d) => d.message)
            });
        }

        const { username, email, password } = value;
        const role = 'user'; // ← toujours


        // 2. Vérifie doublons sur email OU username en une requête
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "Identifiants déjà utilisés" });
        }

        // 3. Création user (le hook mongoose hash auto le mot de passe)
        const user = new User({ username, email, password, role});
        await user.save();

        // === Audit trail après création ===
        await AuditLog.create({
            userId: user._id,
            action: 'register',
            target: 'User',
            targetId: user._id,
            details: {
                email: user.email,
                ip: req.ip
            }
        });

        // Email de confirmation ou bienvenue


        // 4. Réponse sécurisée
        res.status(201).json({ message: "Inscription réussie" });
    } catch (err: any) {
        // 5. Gestion d’erreur serveur
        console.error('Erreur inscription:', err);
        res.status(500).json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
    }
});

export default router;
