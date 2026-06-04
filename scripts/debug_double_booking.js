const request = require('supertest');
const app = require('../app');
const { sequelize, User, Doctor } = require('../src/models');
const { hashPassword } = require('../src/token');

async function run() {
  await sequelize.sync({ force: true });
  const [ah, ph, rh] = await Promise.all([
    hashPassword('admin123'), hashPassword('bemor123'), hashPassword('rec123'),
  ]);
  const doc = await Doctor.create({ full_name: 'Dr. C', specialty: 'Z', department: 'A', phone: '3', email: 'c@c.com', available_status: 'Available' });
  const doctorId = doc.id;
  await User.create({ username: 'admin', password_hash: ah, full_name: 'Admin', role: 'admin' });
  await User.create({ username: 'bemor', password_hash: ph, full_name: 'Test Bemor', role: 'patient' });
  await User.create({ username: 'rec',   password_hash: rh, full_name: 'Rec', role: 'receptionist' });

  const [al, pl, rl] = await Promise.all([
    request(app).post('/api/auth/login').send({ username: 'admin', password: 'admin123' }),
    request(app).post('/api/auth/login').send({ username: 'bemor', password: 'bemor123' }),
    request(app).post('/api/auth/login').send({ username: 'rec',   password: 'rec123' }),
  ]);
  const adminCookie   = al.headers['set-cookie'];
  const patientCookie = pl.headers['set-cookie'];
  const recCookie     = rl.headers['set-cookie'];

  function futureDate(days = 1) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  const date = futureDate(2);
  console.log('Using date', date);
  const r1 = await request(app).post('/api/appointments').set('Cookie', patientCookie)
    .send({ doctor_id: doctorId, date, time: '10:00' });
  console.log('patient create status', r1.status, 'body', r1.body);

  const r2 = await request(app).post('/api/appointments').set('Cookie', recCookie)
    .send({ doctor_id: doctorId, date, time: '10:00', patient_name: 'Boshqa Bemor' });
  console.log('rec create status', r2.status, 'body', r2.body);

  await sequelize.close();
}

run().catch(e => { console.error(e); process.exit(1); });
