'use strict';
require('./setup');
const request = require('supertest');
const app     = require('../app');
const { sequelize, User, Doctor } = require('../src/models');
const { hashPassword } = require('../src/token');

let adminCookie, patientCookie, recCookie;
let doctorId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const [ah, ph, rh] = await Promise.all([
    hashPassword('admin123'), hashPassword('bemor123'), hashPassword('rec123'),
  ]);
  const doc = await Doctor.create({ full_name: 'Dr. C', specialty: 'Z', department: 'A', phone: '3', email: 'c@c.com', available_status: 'Available' });
  doctorId = doc.id;
  await User.create({ username: 'admin', password_hash: ah, full_name: 'Admin', role: 'admin' });
  await User.create({ username: 'bemor', password_hash: ph, full_name: 'Test Bemor', role: 'patient' });
  await User.create({ username: 'rec',   password_hash: rh, full_name: 'Rec', role: 'receptionist' });

  const [al, pl, rl] = await Promise.all([
    request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' }),
    request(app).post('/api/auth/login').send({ username: 'bemor', password: 'bemor123' }),
    request(app).post('/api/auth/login').send({ username: 'rec',   password: 'rec123' }),
  ]);
  adminCookie   = al.headers['set-cookie'];
  patientCookie = pl.headers['set-cookie'];
  recCookie     = rl.headers['set-cookie'];
});

afterAll(async () => { await sequelize.close(); });

function futureDate(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Returns the Nth future weekday (Mon–Sat), skipping Sundays
function futureWeekday(n = 1) {
  const d = new Date();
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) count++;
  }
  return d.toISOString().slice(0, 10);
}

describe('POST /api/appointments', () => {
  it('patient can book an appointment (future date)', async () => {
    const res = await request(app).post('/api/appointments').set('Cookie', patientCookie).send({
      doctor_id: doctorId, date: futureDate(1), time: '09:00', notes: 'Test',
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('booked');
  });

  it('prevents double booking same slot', async () => {
    const date = futureWeekday(2);
    await request(app).post('/api/appointments').set('Cookie', patientCookie)
      .send({ doctor_id: doctorId, date, time: '10:00' });
    const res = await request(app).post('/api/appointments').set('Cookie', recCookie)
      .send({ doctor_id: doctorId, date, time: '10:00', patient_name: 'Boshqa Bemor' });
    expect(res.status).toBe(409);
  });

  it('rejects invalid time slot', async () => {
    const res = await request(app).post('/api/appointments').set('Cookie', patientCookie)
      .send({ doctor_id: doctorId, date: futureDate(3), time: '99:00' });
    expect(res.status).toBe(400);
  });

  it('rejects Sunday', async () => {
    // Find next Sunday
    let d = new Date();
    while (d.getDay() !== 0) d.setDate(d.getDate() + 1);
    const sunday = d.toISOString().slice(0, 10);
    const res = await request(app).post('/api/appointments').set('Cookie', patientCookie)
      .send({ doctor_id: doctorId, date: sunday, time: '09:00' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/appointments', () => {
  it('authenticated user can get appointments', async () => {
    const res = await request(app).get('/api/appointments').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('patient only sees own appointments', async () => {
    const res = await request(app).get('/api/appointments').set('Cookie', patientCookie);
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/appointments/:id/status', () => {
  it('admin can update status', async () => {
    const created = await request(app).post('/api/appointments').set('Cookie', patientCookie)
      .send({ doctor_id: doctorId, date: futureWeekday(4), time: '14:00' });
    expect(created.status).toBe(201);
    const res = await request(app).put(`/api/appointments/${created.body.id}/status`)
      .set('Cookie', adminCookie).send({ status: 'completed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });

  it('patient cannot update status', async () => {
    const created = await request(app).post('/api/appointments').set('Cookie', patientCookie)
      .send({ doctor_id: doctorId, date: futureWeekday(5), time: '15:00' });
    expect(created.status).toBe(201);
    const res = await request(app).put(`/api/appointments/${created.body.id}/status`)
      .set('Cookie', patientCookie).send({ status: 'completed' });
    expect(res.status).toBe(403);
  });
});
