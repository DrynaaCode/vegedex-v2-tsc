import request from 'supertest';
import app from '../src/app';
import Logger from '../src/logger';
// 👇 Demander à Jest de mocker notre module Logger.
// Ceci doit être fait en dehors de tout bloc describe/it.
jest.mock('../src/logger');

describe('Global Error Handler Middleware', () => {

  // Vider les mocks avant chaque test pour s'assurer qu'ils sont propres
  beforeEach(() => {
    // jest.clearAllMocks(); // Si vous utilisez une version plus ancienne de jest
    (Logger.error as jest.Mock).mockClear();
    (Logger.info as jest.Mock).mockClear();
  });

  it('devrait retourner un statut 404 et le message correct pour une NotFoundError', async () => {
    const res = await request(app)
      .get('/test/api-error')
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'Ressource de test non trouvée.'
    });
    // On vérifie que Logger.error n'a PAS été appelé pour une erreur client gérée
    expect(Logger.error).not.toHaveBeenCalled();
  });

  it('devrait retourner un statut 500 et appeler Logger.error pour une erreur serveur', async () => {
    // On ne veut pas polluer la sortie des tests avec l'erreur attendue
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app)
      .get('/test/server-error')
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: 'Erreur serveur.'
    });
    
    // 👇 C'est ici que l'on teste le logger !
    // On vérifie que la méthode 'error' de notre Logger mocké a bien été appelée.
    expect(Logger.error).toHaveBeenCalled();
    
    // On peut même être plus précis et vérifier avec quoi elle a été appelée
    expect(Logger.error).toHaveBeenCalledWith(
      'Erreur inattendue de test.', // Le message de l'erreur
      expect.any(Object) // Le second argument est un objet contenant le stack, etc.
    );

    consoleErrorSpy.mockRestore();
  });
});