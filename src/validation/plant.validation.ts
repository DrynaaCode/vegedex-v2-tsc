// src/validation/plant.validation.ts

import Joi from 'joi';

// Schéma pour valider une seule plante
const plantSchema = Joi.object({
  name: Joi.string().required(),
  latinName: Joi.string().required(),
  description: Joi.string(),
  images: Joi.array().items(Joi.string().uri()),
  family: Joi.string(),
  edibleParts: Joi.array().items(Joi.string()),
  toxic: Joi.boolean().default(false),
  habitats: Joi.array().items(Joi.string()), // On valide des strings (ObjectId)
  seasons: Joi.array().items(Joi.string())
});

// Schéma pour valider un tableau de plantes (entre 1 et 100 à la fois)
export const bulkCreatePlantsSchema = Joi.array().items(plantSchema).min(1).max(100).required();