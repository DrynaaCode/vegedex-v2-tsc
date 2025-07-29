import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import { BadRequestError } from '../errors/api-error';
import { config } from '../config';

// Configure le SDK Cloudinary avec vos clés
cloudinary.config(config.cloudinary);

// Configure le moteur de stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vegedex_plants', // Le nom du dossier où les images seront stockées sur Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png'],
    // transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optionnel: redimensionner les images
  } as any, // 'as any' est parfois nécessaire à cause de types discordants
});

// Filtre pour n'accepter que les images (peut être redondant car Cloudinary le fait aussi)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Seuls les fichiers image sont autorisés !'));
  }
};

// Création du middleware d'upload
const upload = multer({
  storage: storage, // On utilise notre nouveau moteur de stockage
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite la taille des fichiers à 5MB
  }
});

export default upload;