'use strict';
const authService = require('../services/authService');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  maxAge: 8 * 60 * 60 * 1000,
  secure: process.env.NODE_ENV === 'production',
};

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const { token, user } = await authService.login(username, password);
    res.cookie('token', token, COOKIE_OPTS);
    res.json({ ok: true, user, token });
  } catch (e) { next(e); }
}

async function register(req, res, next) {
  try {
    const { token, user } = await authService.register(req.body);
    res.cookie('token', token, COOKIE_OPTS);
    res.status(201).json({ ok: true, user, token });
  } catch (e) { next(e); }
}

function logout(req, res) {
  res.clearCookie('token');
  res.json({ ok: true });
}

function me(req, res) {
  res.json(req.user);
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    res.json(await authService.changePassword(req.user.id, currentPassword, newPassword));
  } catch (e) { next(e); }
}

module.exports = { login, register, logout, me, changePassword };
