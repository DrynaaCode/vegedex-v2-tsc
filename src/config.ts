import dotenv from "dotenv";

// Charge le bon fichier .env en fonction de NODE_ENV
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// Valide que les variables essentielles sont bien présentes
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    throw new Error(`La variable d'environnement ${varName} est manquante.`);
  }
}

// Exporte un objet de configuration propre et typé
export const config = {
  env: process.env.NODE_ENV!,
  port: parseInt(process.env.PORT!, 10),
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  clientUrl: process.env.CLIENT_URL || "*",
   cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  }
};
