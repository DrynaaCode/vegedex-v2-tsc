import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app'; // Attention: tu dois exporter `app` (et non le serveur) dans app.ts

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const db = mongoose.connection.db;
  if (!db) return;
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe('POST /api/auth/register', () => {
  it('inscrit un utilisateur avec succès', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@email.com',
        password: 'TestPassword123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Inscription réussie');
  });

  it('refuse un email déjà utilisé', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'testuser2',
      email: 'dupe@email.com',
      password: 'TestPassword123!'
    });
    const res = await request(app).post('/api/auth/register').send({
      username: 'anotheruser',
      email: 'dupe@email.com',
      password: 'AnotherPassword123!'
    });
    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('message', 'Identifiants déjà utilisés');
  });

  it('refuse une donnée invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'ab', // trop court
        email: 'invalid-email',
        password: '123'
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Données invalides');
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});
