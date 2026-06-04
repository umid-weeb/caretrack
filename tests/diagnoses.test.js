'use strict';
require('./setup');
const request = require('supertest');
const app     = require('../app');
const { sequelize, User, Doctor, Patient } = require('../src/models');
const { hashPassword } = require('../src/token');

let adminCookie, clinCookie;
let patientId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const ah = await hashPassword('admin123');
  const ch = await hashPassword('clin123');
  const doc = await Doctor.create({ full_name: 'Dr. B', specialty: 'Y', department: 'Z', phone: '2', email: 'b@b.com' });
  await User.create({ username: 'admin', password_hash: ah, full_name: 'Admin', role: 'admin' });
  await User.create({ username: 'clin',  password_hash: ch, full_name: 'Clin',  role: 'clinician', doctor_id: doc.id });
  const pat = await Patient.create({ full_name: 'Test Bemor', date_of_birth: '1990-01-01', gender: 'Erkak', doctor_id: doc.id });
  patientId = pat.id;
  const [al, cl] = await Promise.all([
    request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' }),
    request(app).post('/api/auth/login').send({ username: 'clin',  password: 'clin123' }),
  ]);
  adminCookie = al.headers['set-cookie'];
  clinCookie  = cl.headers['set-cookie'];
});

afterAll(async () => { await sequelize.close(); });

const dxData = {
  patient_id: null, icd_code: 'I10', title: 'Arterial gipertenziya',
  severity: 'High', diagnosis_date: '2026-01-01',
};

describe('POST /api/diagnoses', () => {
  it('clinician can create diagnosis', async () => {
    const res = await request(app).post('/api/diagnoses').set('Cookie', clinCookie)
      .send({ ...dxData, patient_id: patientId });
    expect(res.status).toBe(201);
    expect(res.body.icd_code).toBe('I10');
  });

  it('admin can create diagnosis', async () => {
    const res = await request(app).post('/api/diagnoses').set('Cookie', adminCookie)
      .send({ ...dxData, patient_id: patientId, icd_code: 'G35', title: 'Ko\'p skleroz' });
    expect(res.status).toBe(201);
  });

  it('missing required fields returns 400', async () => {
    const res = await request(app).post('/api/diagnoses').set('Cookie', clinCookie)
      .send({ patient_id: patientId, title: 'No ICD' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/diagnoses', () => {
  it('admin can list diagnoses', async () => {
    const res = await request(app).get('/api/diagnoses').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('can filter by severity', async () => {
    const res = await request(app).get('/api/diagnoses?severity=High').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    res.body.forEach(d => expect(d.severity).toBe('High'));
  });
});

describe('PUT /api/diagnoses/:id', () => {
  it('clinician can update diagnosis', async () => {
    const created = await request(app).post('/api/diagnoses').set('Cookie', clinCookie)
      .send({ ...dxData, patient_id: patientId, icd_code: 'J45', title: 'Astma' });
    const res = await request(app).put(`/api/diagnoses/${created.body.id}`)
      .set('Cookie', clinCookie).send({ severity: 'Critical' });
    expect(res.status).toBe(200);
    expect(res.body.severity).toBe('Critical');
  });
});

describe('DELETE /api/diagnoses/:id', () => {
  it('admin can delete diagnosis', async () => {
    const created = await request(app).post('/api/diagnoses').set('Cookie', adminCookie)
      .send({ ...dxData, patient_id: patientId, icd_code: 'DELETE' });
    const res = await request(app).delete(`/api/diagnoses/${created.body.id}`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);
  });

  it('clinician cannot delete diagnosis', async () => {
    const created = await request(app).post('/api/diagnoses').set('Cookie', adminCookie)
      .send({ ...dxData, patient_id: patientId, icd_code: 'X99' });
    const res = await request(app).delete(`/api/diagnoses/${created.body.id}`).set('Cookie', clinCookie);
    expect(res.status).toBe(403);
  });
});
