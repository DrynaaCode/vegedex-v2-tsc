import { Request, Response, NextFunction } from "express";
import { PlantService } from "../services/plant.service";
import { BadRequestError } from "../errors/api-error";
import { bulkCreatePlantsSchema } from "../validation/plant.validation";

export async function getPlants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // On vérifie si req.user a été ajouté par notre middleware optionalAuth
    const isAuthenticated = !!req.user;

    // On passe cette information au service
    const result = await PlantService.findPlants(req.query, isAuthenticated);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getPlantById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const plant = await PlantService.findPlantById(req.params.id);
    res.json(plant);
  } catch (err) {
    next(err);
  }
}

// POST /api/plants
export async function createPlant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Le contrôleur ne fait qu'appeler le service
    const newPlant = await PlantService.createPlant(req.body);
    res.status(201).json(newPlant);
  } catch (err: any) {
    // Si Mongoose échoue (ex: champ requis manquant), on transforme l'erreur en BadRequestError
    // et on la passe au gestionnaire global.
    next(new BadRequestError(err.message));
  }
}

// POST /api/plants/bulk
export async function createManyPlants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 1. Valider le corps de la requête (le tableau de plantes)
    const { error, value } = bulkCreatePlantsSchema.validate(req.body);
    if (error) {
      throw new BadRequestError(error.details.map((d) => d.message).join(", "));
    }

    // 2. Appeler le service pour créer les plantes
    const newPlants = await PlantService.createManyPlants(value);
    res.status(201).json(newPlants);
  } catch (err) {
    // Transmet l'erreur au gestionnaire global
    next(err);
  }
}

export async function addPlantImage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { plantId } = req.params;

    if (!req.file) {
      throw new BadRequestError("Aucun fichier image n'a été envoyé.");
    }

    // Le chemin du fichier est accessible via req.file.path
    const imagePath = req.file.path;

    const updatedPlant = await PlantService.addImageToPlant(plantId, imagePath);
    res.json(updatedPlant);
  } catch (err) {
    next(err);
  }
}
