'use strict';
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || '@#$%&@!@!';
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.warn('Warning: using default JWT secret. Set JWT_SECRET in production.');
}
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };