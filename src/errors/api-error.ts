// src/errors/api-error.ts

/**
 * Classe de base pour les erreurs personnalisées de l'API.
 * Permet de définir un code de statut HTTP et un message clair.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Rétablit le prototype pour que `instanceof` fonctionne correctement
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Erreur pour les ressources non trouvées (404).
 */
export class NotFoundError extends ApiError {
  constructor(message: string = "Ressource non trouvée") {
    super(message, 404);
  }
}

/**
 * Erreur pour les mauvaises requêtes (400).
 * Typiquement utilisé pour les erreurs de validation.
 */
export class BadRequestError extends ApiError {
  constructor(message: string = "Requête invalide") {
    super(message, 400);
  }
}

/**
 * Erreur pour les accès non autorisés (401)
 * L'utilisateur n'est pas authentifié.
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = "Accès non autorisé") {
    super(message, 401);
  }
}

/**
 * Erreur pour les accès interdits (403).
 * L'utilisateur est authentifié mais n'a pas les droits nécessaires.
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = "Accès refusé") {
    super(message, 403);
  }
}