'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const SALT_ROUNDS = 10;
const MODE = process.env.PASSWORD_HASH_MODE || 'sha256_32'; // default assignment-mode is 32-char sha256

async function hashPassword(password) {
  if (MODE === 'sha256_32') {
    return crypto.createHash('sha256').update(password).digest('hex').slice(0, 32);
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  if (MODE === 'sha256_32') {
    const candidate = crypto.createHash('sha256').update(password).digest('hex').slice(0, 32);
    return candidate === hash;
  }
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword, MODE };