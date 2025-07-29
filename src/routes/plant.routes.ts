import { Router } from "express";
import {
  getPlants,
  getPlantById,
  createPlant,
  createManyPlants,
  addPlantImage,
} from "../controllers/plant.controller";
import { optionalAuth } from "../middlewares/optionalAuth";
import { authenticateJWT } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload";
import { hasRole } from "../middlewares/hasRole";

const router = Router();

router.get("/", optionalAuth, getPlants);
router.get("/:id", optionalAuth, getPlantById);

router.post("/", authenticateJWT, hasRole("admin", "moderator"), createPlant);
router.post("/bulk", authenticateJWT, hasRole("admin", "moderator"),createManyPlants);

// 'image' est le nom du champ dans le formulaire (form-data)
router.post(
  "/:plantId/image",
  authenticateJWT,
  hasRole("admin", "moderator"),

  upload.single("image"),
  addPlantImage
);
export default router;
