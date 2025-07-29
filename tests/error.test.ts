import request from 'supertest';
import app from '../src/app';

describe('Global Error Handler Middleware', () => {
  // Store the original console.error function
  let consoleErrorSpy: jest.SpyInstance;

  // Before each test in this block, mock console.error
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // After each test, restore the original function
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });


  it('devrait retourner un statut 404 et le message correct pour une NotFoundError', async () => {
    const res = await request(app)
      .get('/test/api-error')
      .send();

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      message: 'Ressource de test non trouvée.'
    });
  });

  it('devrait retourner un statut 500 et un message générique pour une erreur serveur', async () => {
    const res = await request(app)
      .get('/test/server-error')
      .send();

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({
      message: 'Erreur serveur.'
    });
    // Optional: You can also assert that the mock was called
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});