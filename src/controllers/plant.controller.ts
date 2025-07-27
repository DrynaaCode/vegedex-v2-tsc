import { Request, Response } from 'express';
import Plant from '../models/plant.model';

// GET /plants
export async function getPlants(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
  const filters: any = {};

  if (req.query.q) filters.name = new RegExp(req.query.q as string, 'i');
  if (req.query.family) filters.family = req.query.family;
  // Ajoute d'autres filtres au besoin

  try {
    const plants = await Plant.find(filters)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Plant.countDocuments(filters);

    res.json({
      plants,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: "Erreur lors de la récupération des plantes", error: err.message });
  }
}

// GET /plants/:id
export async function getPlantById(req: Request, res: Response) {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ message: "Plante non trouvée" });
    res.json(plant);
  } catch (err: any) {
    res.status(500).json({ message: "Erreur lors de la récupération de la plante", error: err.message });
  }
}


// POST /api/plants
export async function createPlant(req: Request, res: Response) {
    try {
        const plant = new Plant(req.body);
        await plant.save();
        res.status(201).json(plant);
    } catch (err: any) {
        res.status(400).json({
            message: "Erreur lors de l’ajout de la plante",
            error: err.message
        });
    }
}