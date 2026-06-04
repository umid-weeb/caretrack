'use strict';
const { Server } = require('socket.io');
const { verifyToken } = require('../token/jwt');

let io = null;

function init(server) {
  io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token || socket.handshake.query && socket.handshake.query.token;
    if (!token) return next(new Error('Authentication token required'));
    try {
      const payload = verifyToken(token);
      socket.user = payload;
      return next();
    } catch (e) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user && socket.user.id;
    if (userId) socket.join(`user:${userId}`);

    socket.on('disconnect', () => {});
  });
}

function notifyUser(userId, event, data) {
  if (!io) return;
  try {
    io.to(`user:${userId}`).emit(event, data);
  } catch (e) {
    // ignore
  }
}

module.exports = { init, notifyUser };
