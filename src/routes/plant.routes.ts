import { Router } from 'express';
import { getPlants, getPlantById, createPlant } from '../controllers/plant.controller';

const router = Router();

router.get('/', getPlants);
router.get('/:id', getPlantById);
router.post('/', createPlant);

export default router;
