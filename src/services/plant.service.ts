// src/services/plant.service.ts
import Plant, { IPlant } from "../models/plant.model";
import { NotFoundError } from "../errors/api-error";

export class PlantService {
  /**
   * Récupère une liste de plantes avec des règles différentes pour les invités et les membres.
   * @param queryParams Les paramètres de la requête.
   * @param isAuthenticated Un booléen indiquant si l'utilisateur est connecté.
   */
  public static async findPlants(queryParams: any, isAuthenticated: boolean) {
    let page: number;
    let limit: number;

    if (isAuthenticated) {
      // Logique pour les utilisateurs connectés (avec pagination complète)
      page = Math.max(1, Number(queryParams.page) || 1);
      limit = Math.max(1, Math.min(Number(queryParams.limit) || 20, 100));
    } else {
      // Logique pour les invités : 50 premiers résultats, pas de pagination
      page = 1;
      limit = 50;
    }

    const filters: any = {};
    if (queryParams.q) filters.name = new RegExp(queryParams.q as string, "i");
    if (queryParams.family) filters.family = queryParams.family;

    const plants = await Plant.find(filters)
      .sort({ name: 1 }) // Tri par ordre alphabétique
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Plant.countDocuments(filters);

    return {
      plants,
      pagination: {
        total: isAuthenticated ? total : Math.min(total, 50),
        page,
        limit,
        pages: isAuthenticated ? Math.ceil(total / limit) : 1,
      },
      // Message pour inciter à l'inscription
      ...(!isAuthenticated && {
        notice:
          "Pour voir plus de résultats, veuillez vous inscrire ou vous connecter.",
      }),
    };
  }

  /**
   * Récupère une plante par son ID.
   */
  public static async findPlantById(plantId: string): Promise<IPlant> {
    const plant = await Plant.findById(plantId);
    if (!plant) {
      throw new NotFoundError("Plante non trouvée");
    }
    return plant;
  }
  /**
   * Crée une nouvelle plante dans la base de données.
   * @param plantData Les données de la plante à créer.
   * @returns La plante qui vient d'être créée.
   */
  public static async createPlant(plantData: Partial<IPlant>): Promise<IPlant> {
    const plant = new Plant(plantData);
    await plant.save(); // La validation de Mongoose se fait ici
    return plant;
  }

   /**
   * Crée plusieurs plantes en une seule opération.
   * @param plantsData Un tableau de données de plantes à créer.
   * @returns Les plantes qui viennent d'être créées.
   */
  public static async createManyPlants(plantsData: Partial<IPlant>[]): Promise<IPlant[]> {
    // insertMany est très efficace et valide chaque plante contre le schéma Mongoose.
    const createdPlants = await Plant.insertMany(plantsData) as IPlant[];
    return createdPlants;
  }

  /**
   * Ajoute le chemin d'une image à une plante.
   * @param plantId L'ID de la plante.
   * @param imagePath Le chemin vers le fichier image stocké.
   * @returns La plante mise à jour.
   */
  public static async addImageToPlant(plantId: string, imagePath: string): Promise<IPlant> {
    const plant = await this.findPlantById(plantId); // Réutilise la méthode existante pour trouver la plante

    // Ajoute le nouveau chemin d'image au tableau
    plant.images = plant.images || [];
    plant.images.push(imagePath);

    await plant.save();
    return plant;
  }
}
