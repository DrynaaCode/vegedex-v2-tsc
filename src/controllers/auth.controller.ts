import { NextFunction, Request, Response } from "express";
import User from "../models/user.model";
import AuditLog from "../models/audit.model";
import { registerSchema, loginSchema } from "../validation/auth.validation";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid"; // tout en haut (pnpm add uuid)

// Helper: délai anti-bruteforce
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function register(req: Request, res: Response) {
  try {
    // 1. Validation Joi avec nettoyage
    const { error, value } = registerSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: "Données invalides",
        details: error.details.map((d) => d.message),
      });
    }

    const username = value.username.trim();
    const email = value.email.toLowerCase().trim();
    const password = value.password;

    // 2. Vérifie doublons sur email OU username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // Toujours le même message (privacy)
      return res.status(409).json({ message: "Identifiants déjà utilisés" });
    }

    // 3. Création user (password hashé en pre-save)
    const user = new User({ username, email, password, role: "user" });
    await user.save();

    // 4. Audit trail (jamais de mot de passe loggué)
    await AuditLog.create({
      userId: user._id,
      action: "register",
      target: "User",
      targetId: user._id,
      details: { email: user.email, ip: req.ip },
    });

    // (Optionnel) Envoi email de confirmation ici

    // 5. Réponse sécurisée (jamais de données sensibles)
    res.status(201).json({ message: "Inscription réussie" });
  } catch (err: any) {
    console.error("Erreur inscription:", err);
    res
      .status(500)
      .json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
  }
}

export async function login(req: Request, res: Response) {
  try {
    // 1. Validation stricte des entrées
    const { error, value } = loginSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      // Toujours même réponse pour ne rien leak
      await sleep(Math.random() * 400 + 200);
      return res.status(401).json({ message: "Identifiants incorrects" });
    }
    const email = value.email.toLowerCase().trim();
    const password = value.password;

    // 2. Recherche user actif (toujours la même réponse si not found)
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      await sleep(Math.random() * 400 + 200);
      await AuditLog.create({
        action: "login_failed",
        target: "User",
        details: { email, reason: "user_not_found", ip: req.ip },
      });
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 3. Vérification du mot de passe (toujours délai anti-bruteforce)
    const valid = await user.comparePassword(password);
    if (!valid) {
      await sleep(Math.random() * 400 + 200);
      await AuditLog.create({
        userId: user._id,
        action: "login_failed",
        target: "User",
        targetId: user._id,
        details: { email, reason: "wrong_password", ip: req.ip },
      });
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // 4. Génère un JWT (durée courte : 1h, à compléter par refresh token si tu veux "remember me")
    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    // 4b. Génère un refreshToken (aléatoire, UUID ou crypto)
    const refreshToken = uuidv4();
    user.refreshToken = refreshToken;
    await user.save();

    // 5. Cookie sécurisé (httpOnly, sameSite, secure selon env)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 👈 MODIFIEZ CETTE LIGNE
      maxAge: 60 * 60 * 1000, // 1h
    });

    // 5b. Cookie sécurisé pour le refreshToken (même options mais + long)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 👈 MODIFIEZ CETTE LIGNE
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    // 6. Audit trail succès
    await AuditLog.create({
      userId: user._id,
      action: "login_success",
      target: "User",
      targetId: user._id,
      details: { email: user.email, ip: req.ip },
    });

    // 7. Réponse sécurisée (jamais de token en JSON si tu utilises le cookie !)
    res.json({
      message: "Connexion réussie",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        bio: user.bio,
      },
    });
  } catch (err) {
    console.error("Erreur login:", err);
    res
      .status(500)
      .json({ message: "Erreur serveur. Veuillez réessayer plus tard." });
  }
}

export async function logout(req: Request, res: Response) {
  const isProduction = process.env.NODE_ENV === "production";

  // Optionnel : retire le refreshToken côté DB si tu l'utilises vraiment
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await User.updateOne(
      { refreshToken },
      { $unset: { refreshToken: "" } }
    );
  }

  // Supprime les cookies côté client (mêmes options qu'au setCookie)
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/", // Très important !
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.json({ message: "Déconnexion réussie" });
}


export async function forgotPassword(req: Request, res: Response, next: NextFunction) { // Ajoutez next
  try {
    const email = (req.body.email || '').toLowerCase().trim();
    const msg = "Si cet email existe, un lien de réinitialisation a été envoyé.";

    const user = await User.findOne({ email });
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'utilisateur existe.
      // On attend un peu pour ne pas donner d'indice sur l'existence du compte.
      await new Promise(resolve => setTimeout(resolve, 500));
      return res.status(200).json({ message: msg });
    }

    // Token sécurisé (en clair pour le mail, hashé pour la DB)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    // === À FAIRE === ENVOI MAIL avec rawToken ===
    // ex: sendResetEmail(user.email, rawToken)

    await AuditLog.create({
        userId: user._id,
        action: 'forgot_password_requested',
        target: 'User',
        targetId: user._id,
        details: { email, ip: req.ip }
    });

    // On retourne le token uniquement en environnement de test
    if (process.env.NODE_ENV === 'test') {
        return res.json({ message: msg, resetToken: rawToken });
    }

    return res.json({ message: msg });

  } catch (err) {
    next(err); // Transmet l'erreur au gestionnaire global
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  // Hash du token reçu (jamais stocker le token brut en DB)
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) {
    return res.status(400).json({ message: "Lien invalide ou expiré" });
  }

  user.password = newPassword; // sera hashé via pre-save
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await AuditLog.create({
    userId: user._id,
    action: "password_reset_success",
    target: "User",
    targetId: user._id,
    details: { email: user.email, ip: req.ip },
  });

  res.json({ message: "Votre mot de passe a été réinitialisé avec succès" });
}

export async function refreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token manquant" });
  }

  const user = await User.findOne({ refreshToken, isActive: true });
  if (!user) {
    return res.status(403).json({ message: "Refresh token invalide" });
  }

  // Regénère un access token (courte durée)
  const payload = { userId: user._id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });

  // (optionnel) Tu peux aussi renouveler le refreshToken ici !
  // const newRefreshToken = uuidv4();
  // user.refreshToken = newRefreshToken;
  // await user.save();
  // res.cookie('refreshToken', newRefreshToken, {...});

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 1000, // 1h
  });

  res.json({ message: "Token rafraîchi" });
}
