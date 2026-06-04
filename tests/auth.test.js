'use strict';
require('./setup');
const request  = require('supertest');
const app      = require('../app');
const { sequelize, User } = require('../src/models');
const { hashPassword } = require('../src/token');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const hash = await hashPassword('admin123');
  await User.create({ username: 'admin@gmail.com', password_hash: hash, full_name: 'Admin User', role: 'admin' });
  const ph = await hashPassword('bemor123');
  await User.create({ username: 'bemor1', password_hash: ph, full_name: 'Test Bemor', role: 'patient' });
});

afterAll(async () => { await sequelize.close(); });

describe('POST /api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin@gmail.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.role).toBe('admin');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin@gmail.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('should reject non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'x' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/register', () => {
  it('should register a new patient user', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'newuser1', password: 'pass123', full_name: 'New User' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('patient');
  });

  it('should reject short password', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'u2', password: '123', full_name: 'X' });
    expect(res.status).toBe(400);
  });

  it('should reject duplicate username', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ username: 'admin@gmail.com', password: 'pass123', full_name: 'Dup' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/auth/me', () => {
  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return current user when authenticated', async () => {
    const loginRes = await request(app).post('/api/auth/login')
      .send({ username: 'admin@gmail.com', password: 'admin123' });
    const cookie = loginRes.headers['set-cookie'];
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('admin@gmail.com');
  });

  it('should authenticate using Authorization bearer token', async () => {
    const loginRes = await request(app).post('/api/auth/login')
      .send({ username: 'admin@gmail.com', password: 'admin123' });
    expect(loginRes.body.token).toBeDefined();
    const bearerRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);
    expect(bearerRes.status).toBe(200);
    expect(bearerRes.body.username).toBe('admin@gmail.com');
  });
});
