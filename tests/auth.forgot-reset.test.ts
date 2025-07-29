import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app';
import User from '../src/models/user.model';

let mongoServer: MongoMemoryServer;

// Démarre un serveur de base de données en mémoire avant tous les tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Arrête le serveur et la connexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Vide la collection des utilisateurs après chaque test pour un environnement propre
afterEach(async () => {
  await User.deleteMany({});
});

describe('Flux de mot de passe oublié/réinitialisé', () => {

  it('devrait permettre à un utilisateur de réinitialiser son mot de passe et de se connecter', async () => {
    // ÉTAPE 1: Créer un utilisateur pour le test
    await new User({
      username: 'forgottest',
      email: 'forgot@test.com',
      password: 'OldPassword123!',
    }).save();

    // ÉTAPE 2: Demander la réinitialisation du mot de passe
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'forgot@test.com' });
    
    expect(forgotRes.statusCode).toBe(200);
    expect(forgotRes.body.resetToken).toBeDefined(); // Vérifie que le token est bien retourné en mode test
    
    const { resetToken } = forgotRes.body;

    // ÉTAPE 3: Utiliser le token pour définir un nouveau mot de passe
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'MyNewStrongPassword!'
      });

    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.body.message).toBe("Votre mot de passe a été réinitialisé avec succès");

    // ÉTAPE 4: Vérifier que l'on peut se connecter avec le nouveau mot de passe
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'forgot@test.com',
        password: 'MyNewStrongPassword!'
      });
      
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body.user.username).toBe('forgottest');
  });

});