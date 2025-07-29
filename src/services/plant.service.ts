// src/services/plant.service.ts
import Plant, { IPlant } from "../models/plant.model";
import { NotFoundError } from "../errors/api-error";
import Logger from "../logger";

export class PlantService {
  /**
   * Récupère une liste de plantes avec des règles différentes pour les invités et les membres.
   */
  public static async findPlants(queryParams: any, isAuthenticated: boolean) {
    Logger.info(`Recherche de plantes demandée.`, { isAuthenticated, queryParams });
    
    let page: number;
    let limit: number;

    if (isAuthenticated) {
      page = Math.max(1, Number(queryParams.page) || 1);
      limit = Math.max(1, Math.min(Number(queryParams.limit) || 20, 100));
    } else {
      page = 1;
      limit = 50;
    }

    const filters: any = {};
    if (queryParams.q) filters.name = new RegExp(queryParams.q as string, "i");
    if (queryParams.family) filters.family = queryParams.family;

    const plants = await Plant.find(filters)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Plant.countDocuments(filters);

    Logger.info(`${plants.length} plantes trouvées sur un total de ${total}.`);

    return {
      plants,
      pagination: {
        total: isAuthenticated ? total : Math.min(total, 50),
        page,
        limit,
        pages: isAuthenticated ? Math.ceil(total / limit) : 1,
      },
      ...(!isAuthenticated && {
        notice: "Pour voir plus de résultats, veuillez vous inscrire ou vous connecter.",
      }),
    };
  }

  /**
   * Récupère une plante par son ID.
   */
  public static async findPlantById(plantId: string): Promise<IPlant> {
    const plant = await Plant.findById(plantId);
    if (!plant) {
      // On utilise 'warn' car ce n'est pas une erreur critique, mais une information importante.
      Logger.warn(`Plante non trouvée pour l'ID: ${plantId}`);
      throw new NotFoundError("Plante non trouvée");
    }
    return plant;
  }

  /**
   * Crée une nouvelle plante dans la base de données.
   */
  public static async createPlant(plantData: Partial<IPlant>): Promise<IPlant> {
    const plant = new Plant(plantData);
    await plant.save();
    Logger.info(`Nouvelle plante créée avec succès : ${plant.name} (ID: ${plant.id})`);
    return plant;
  }

  /**
   * Crée plusieurs plantes en une seule opération.
   */
  public static async createManyPlants(plantsData: Partial<IPlant>[]): Promise<IPlant[]> {
    Logger.info(`Tentative de création en masse de ${plantsData.length} plantes.`);
    const createdPlants = await Plant.insertMany(plantsData) as IPlant[];
    Logger.info(`${createdPlants.length} plantes créées avec succès via l'opération en masse.`);
    return createdPlants;
  }

  /**
   * Ajoute le chemin d'une image à une plante.
   */
  public static async addImageToPlant(plantId: string, imagePath: string): Promise<IPlant> {
    const plant = await this.findPlantById(plantId);

    plant.images = plant.images || [];
    plant.images.push(imagePath);

    await plant.save();
    Logger.info(`Image ajoutée avec succès à la plante ${plant.name} (ID: ${plantId}). Nouveau chemin: ${imagePath}`);
    return plant;
  }
}