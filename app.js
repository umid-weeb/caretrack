'use strict';
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth',          require('./src/routes/authRoutes'));
app.use('/api/doctors',       require('./src/routes/doctorRoutes'));
app.use('/api/patients',      require('./src/routes/patientRoutes'));
app.use('/api/diagnoses',     require('./src/routes/diagnosisRoutes'));
app.use('/api/appointments',  require('./src/routes/appointmentRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/reports',       require('./src/routes/reportRoutes'));
app.use('/api/users',         require('./src/routes/userRoutes'));

// SPA: all non-API routes serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

module.exports = app;
