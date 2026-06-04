'use strict';
require('./setup');
const request = require('supertest');
const app     = require('../app');
const { sequelize, User, Doctor } = require('../src/models');
const { hashPassword } = require('../src/token');

let adminCookie;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const hash = await hashPassword('admin123');
  await User.create({ username: 'admin', password_hash: hash, full_name: 'Admin', role: 'admin' });
  const hash2 = await hashPassword('rec123');
  await User.create({ username: 'rec', password_hash: hash2, full_name: 'Rec', role: 'receptionist' });
  const login = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' });
  adminCookie = login.headers['set-cookie'];
});

afterAll(async () => { await sequelize.close(); });

describe('GET /api/doctors', () => {
  it('admin can list doctors', async () => {
    const res = await request(app).get('/api/doctors').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('unauthenticated gets 401', async () => {
    const res = await request(app).get('/api/doctors');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/doctors', () => {
  it('admin can create doctor', async () => {
    const res = await request(app).post('/api/doctors').set('Cookie', adminCookie).send({
      full_name: 'Dr. Test', specialty: 'Terapevt', department: 'Terapiya',
      phone: '+998901234567', email: 'test.doc@caretrack.uz',
    });
    expect(res.status).toBe(201);
    expect(res.body.full_name).toBe('Dr. Test');
    expect(res.body.defaultPassword).toBeDefined();
  });

  it('non-admin gets 403', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'rec', password: 'rec123' });
    const cookie = login.headers['set-cookie'];
    const res = await request(app).post('/api/doctors').set('Cookie', cookie).send({
      full_name: 'Dr. X', specialty: 'X', department: 'X', phone: '111', email: 'x@x.com',
    });
    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields missing', async () => {
    const res = await request(app).post('/api/doctors').set('Cookie', adminCookie).send({ full_name: 'No Email' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/doctors/:id', () => {
  it('admin can update doctor', async () => {
    const doc = await Doctor.findOne();
    const res = await request(app).put(`/api/doctors/${doc.id}`).set('Cookie', adminCookie)
      .send({ available_status: 'Off-duty' });
    expect(res.status).toBe(200);
    expect(res.body.available_status).toBe('Off-duty');
  });
});

describe('DELETE /api/doctors/:id', () => {
  it('admin can delete doctor with no patients', async () => {
    const docRes = await request(app).post('/api/doctors').set('Cookie', adminCookie).send({
      full_name: 'To Delete', specialty: 'X', department: 'X', phone: '111', email: 'todelete@caretrack.uz',
    });
    const res = await request(app).delete(`/api/doctors/${docRes.body.id}`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
