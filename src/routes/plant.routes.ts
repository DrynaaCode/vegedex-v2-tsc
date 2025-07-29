import { Router } from 'express';
import { getPlants, getPlantById, createPlant, createManyPlants, addPlantImage } from '../controllers/plant.controller'; 
import { optionalAuth } from '../middlewares/optionalAuth';
import { authenticateJWT } from '../middlewares/auth.middleware';
import upload from '../middlewares/upload';

const router = Router();

router.get('/',optionalAuth, getPlants);
router.get('/:id', getPlantById);
router.post('/',createPlant);
router.post('/bulk', authenticateJWT, createManyPlants);

// 'image' est le nom du champ dans le formulaire (form-data)
router.post('/:plantId/image',authenticateJWT,upload.single('image'), addPlantImage);
export default router;
