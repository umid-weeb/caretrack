'use strict';
require('./setup');
const request = require('supertest');
const app     = require('../app');
const { sequelize, User, Doctor } = require('../src/models');
const { hashPassword } = require('../src/token');

let adminCookie, clinCookie, recCookie;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const ah = await hashPassword('admin123');
  const ch = await hashPassword('clin123');
  const rh = await hashPassword('rec123');
  const ph = await hashPassword('bemor123');
  const doc = await Doctor.create({ full_name: 'Dr. A', specialty: 'X', department: 'Y', phone: '1', email: 'a@a.com' });
  await User.create({ username: 'admin', password_hash: ah, full_name: 'Admin', role: 'admin' });
  await User.create({ username: 'clin',  password_hash: ch, full_name: 'Clin',  role: 'clinician', doctor_id: doc.id });
  await User.create({ username: 'rec',   password_hash: rh, full_name: 'Rec',   role: 'receptionist' });
  await User.create({ username: 'bemor', password_hash: ph, full_name: 'Bemor', role: 'patient' });

  const [al, cl, rl] = await Promise.all([
    request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' }),
    request(app).post('/api/auth/login').send({ username: 'clin',  password: 'clin123' }),
    request(app).post('/api/auth/login').send({ username: 'rec',   password: 'rec123' }),
  ]);
  adminCookie = al.headers['set-cookie'];
  clinCookie  = cl.headers['set-cookie'];
  recCookie   = rl.headers['set-cookie'];
});

afterAll(async () => { await sequelize.close(); });

const newPatient = { full_name: 'Alisher Test', date_of_birth: '1990-01-01', gender: 'Erkak', phone: '+998901' };

describe('POST /api/patients', () => {
  it('admin can create patient', async () => {
    const res = await request(app).post('/api/patients').set('Cookie', adminCookie).send(newPatient);
    expect(res.status).toBe(201);
    expect(res.body.full_name).toBe('Alisher Test');
  });
  it('receptionist can create patient', async () => {
    const res = await request(app).post('/api/patients').set('Cookie', recCookie)
      .send({ ...newPatient, full_name: 'Rec Patient' });
    expect(res.status).toBe(201);
  });
  it('clinician cannot create patient', async () => {
    const res = await request(app).post('/api/patients').set('Cookie', clinCookie).send(newPatient);
    expect(res.status).toBe(403);
  });
  it('missing required fields returns 400', async () => {
    const res = await request(app).post('/api/patients').set('Cookie', adminCookie)
      .send({ full_name: 'No DOB' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/patients', () => {
  it('admin can list patients', async () => {
    const res = await request(app).get('/api/patients').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('patient role gets 403', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'bemor', password: 'bemor123' });
    const res = await request(app).get('/api/patients').set('Cookie', login.headers['set-cookie']);
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/patients/:id', () => {
  it('clinician can update patient', async () => {
    const created = await request(app).post('/api/patients').set('Cookie', adminCookie)
      .send({ ...newPatient, full_name: 'Edit Me' });
    const res = await request(app).put(`/api/patients/${created.body.id}`)
      .set('Cookie', clinCookie).send({ address: 'Yangi manzil' });
    expect(res.status).toBe(200);
    expect(res.body.address).toBe('Yangi manzil');
  });
});

describe('DELETE /api/patients/:id', () => {
  it('admin can delete patient', async () => {
    const created = await request(app).post('/api/patients').set('Cookie', adminCookie)
      .send({ ...newPatient, full_name: 'Delete Me' });
    const res = await request(app).delete(`/api/patients/${created.body.id}`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
  it('clinician cannot delete patient', async () => {
    const created = await request(app).post('/api/patients').set('Cookie', adminCookie)
      .send({ ...newPatient, full_name: 'No Delete' });
    const res = await request(app).delete(`/api/patients/${created.body.id}`).set('Cookie', clinCookie);
    expect(res.status).toBe(403);
  });
});
