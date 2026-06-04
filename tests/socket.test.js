const http = require('http');
const ioClient = require('socket.io-client');
const socketService = require('../src/sockets/socketService');
const { signToken } = require('../src/token');
const { User } = require('../src/models');
const app = require('../app');

let server;
let url;
const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = http.createServer(app).listen(0);
  const port = server.address().port;
  url = `http://127.0.0.1:${port}`;
  socketService.init(server);
});

afterAll(async () => {
  try { server.close(); } catch (e) {}
  await sequelize.close();
});

test('socket auth and notifyUser', done => {
  (async () => {
    // create a transient user in DB
    const u = await User.create({ username: `socket_test_${Date.now()}`, password_hash: 'x', full_name: 'Socket Test', role: 'clinician' });
    const token = signToken({ id: u.id, username: u.username, full_name: u.full_name, role: u.role });

    const socket = ioClient(url, { auth: { token }, transports: ['websocket'] });
    socket.on('connect', () => {
      // emit notification from server side
      socketService.notifyUser(u.id, 'socket-test', { hello: 'world' });
    });

    socket.on('socket-test', data => {
      try {
        expect(data).toBeDefined();
        expect(data.hello).toBe('world');
        socket.disconnect();
        done();
      } catch (e) { done(e); }
    });

    socket.on('connect_error', err => done(err));
  })();
}, 10000);
