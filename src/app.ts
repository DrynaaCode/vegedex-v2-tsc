import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import plantRoutes from "./routes/plant.routes";

import { ApiError, NotFoundError } from "./errors/api-error";

import swaggerUi from "swagger-ui-express";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

import Logger from "./logger";

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const app = express();

// --- Configuration de Swagger avec le fichier YAML ---
// Charger le fichier swagger.yaml
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "../swagger.yaml"), "utf8")
) as Record<string, any>;

// Sécurité de base
app.use(helmet());
app.use(cors({ 
  origin: process.env.CLIENT_URL || '*', 
  credentials: true // 👈 AJOUTEZ CETTE OPTION
}));

// Rate limiter global (tu peux personnaliser)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (_, res) => res.send("Hello Plant API!"));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/plants", plantRoutes);

// Routes admin (à ajouter si tu as des routes admin)
app.use("/api/admin", adminRoutes);

//Documentation Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes de test (uniquement si NODE_ENV est 'test')
if (process.env.NODE_ENV === "test") {
  app.get("/test/api-error", (req, res, next) => {
    // Simule une erreur personnalisée
    next(new NotFoundError("Ressource de test non trouvée."));
  });

  app.get("/test/server-error", (req, res, next) => {
    // Simule une erreur serveur générique
    next(new Error("Erreur inattendue de test."));
  });
}

// Gestion d'erreur JSON mal formé
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res
      .status(400)
      .json({ message: "JSON invalide (erreur de syntaxe)" });
  }
  next(err);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Si c'est une de nos erreurs personnalisées, on l'utilise
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Sinon, c'est une erreur serveur inattendue
  // console.error('Erreur serveur inattendue:', err);
  Logger.error(err.message, { stack: err.stack, path: req.path });

  res.status(500).json({ message: "Erreur serveur." });
});

export default app;
