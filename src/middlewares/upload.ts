import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { BadRequestError } from '../errors/api-error';

// Configuration du stockage sur le disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Les fichiers seront stockés dans un dossier 'uploads/' à la racine du projet
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Crée un nom de fichier unique pour éviter les conflits
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Seuls les fichiers image sont autorisés !'));
  }
};

// Création du middleware d'upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite la taille des fichiers à 5MB
  }
});

export default upload;