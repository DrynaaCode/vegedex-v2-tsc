import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/user.model';
import Plant from '../src/models/plant.model';

let mongoServer: MongoMemoryServer;
let adminCookie: string[];
let userCookie: string[];
let testPlantId: string;

// -- SETUP --
// Démarre la base de données en mémoire avant tous les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Arrête la base de données après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Prépare l'environnement avant chaque test
beforeEach(async () => {
  // Créer un utilisateur 'admin' et un utilisateur 'user'
  await User.create([
    { username: 'testadmin', email: 'admin@test.com', password: 'password', role: 'admin' },
    { username: 'testuser', email: 'user@test.com', password: 'password', role: 'user' }
  ]);
  
  // Crée une plante de test pour les routes qui nécessitent un ID
  const plant = await Plant.create({ name: 'Test Plant', latinName: 'Testus plantus' });
  testPlantId = plant.id.toString();

  // Se connecter en tant qu'admin et stocker son cookie
  const adminLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'password' });
  adminCookie = adminLoginRes.get('Set-Cookie')!;

  // Se connecter en tant qu'utilisateur normal et stocker son cookie
  const userLoginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@test.com', password: 'password' });
  userCookie = userLoginRes.get('Set-Cookie')!;
});

// Vide les collections après chaque test
afterEach(async () => {
  await User.deleteMany({});
  await Plant.deleteMany({});
});

// -- TESTS --
describe('Sécurité des routes /api/plants', () => {
  
  // Scénario 1 : Création d'une seule plante (POST /api/plants)
  describe('POST /api/plants', () => {
    it('devrait refuser un utilisateur normal avec une erreur 403', async () => {
      await request(app)
        .post('/api/plants')
        .set('Cookie', userCookie) // On utilise le cookie de l'utilisateur normal
        .send({ name: 'Plante interdite', latinName: 'Prohibitus planta' })
        .expect(403); // On s'attend à une erreur "Forbidden"
    });

    it('devrait autoriser un admin', async () => {
      await request(app)
        .post('/api/plants')
        .set('Cookie', adminCookie) // On utilise le cookie de l'admin
        .send({ name: 'Plante autorisée', latinName: 'Permissus planta' })
        .expect(201); // On s'attend à un succès "Created"
    });
  });

  // Scénario 2 : Création en masse (POST /api/plants/bulk)
  describe('POST /api/plants/bulk', () => {
    const bulkData = [{ name: 'Plante en masse', latinName: 'Bulk planta' }];

    it('devrait refuser un utilisateur normal avec une erreur 403', async () => {
      await request(app)
        .post('/api/plants/bulk')
        .set('Cookie', userCookie)
        .send(bulkData)
        .expect(403);
    });

    it('devrait autoriser un admin', async () => {
      await request(app)
        .post('/api/plants/bulk')
        .set('Cookie', adminCookie)
        .send(bulkData)
        .expect(201);
    });
  });
  
  // Scénario 3 : Ajout d'une image (POST /api/plants/:id/image)
  describe('POST /api/plants/:plantId/image', () => {
    it('devrait refuser un utilisateur normal avec une erreur 403', async () => {
      await request(app)
        .post(`/api/plants/${testPlantId}/image`)
        .set('Cookie', userCookie)
        // On simule l'envoi d'un champ sans fichier pour tester la protection avant l'upload
        .send() 
        .expect(403);
    });

    it('devrait autoriser un admin (même si l\'upload échoue)', async () => {
      const res = await request(app)
        .post(`/api/plants/${testPlantId}/image`)
        .set('Cookie', adminCookie)
        .send();

      // Ici, on s'attend à une erreur 400 car aucun fichier n'a été envoyé,
      // MAIS PAS une erreur 403. Cela prouve que le middleware hasRole a bien laissé passer l'admin.
      expect(res.statusCode).toBe(400); 
      expect(res.body.message).toBe("Aucun fichier image n'a été envoyé.");
    });
  });

});