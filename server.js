'use strict';
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3001;

async function start() {
  console.log('🔌 DB ulanish tekshirilmoqda...');
  await sequelize.authenticate();
  console.log('✅ DB ulanish muvaffaqiyatli');

  console.log('🧱 Jadvallar tekshirilmoqda...');
  await sequelize.sync({ alter: { drop: false } });
  console.log('✅ Jadvallar sinxronizatsiya qilindi');

  // Seed if empty
  const { User } = require('./src/models');
  const count = await User.count();
  if (count === 0) {
    console.log('🌱 Initial seed bajarilmoqda...');
    await require('./src/config/seed')();
    console.log('✅ Seed tugadi');
  }

  const server = app.listen(PORT, () => {
    console.log(`\n✅ CareTrack CRM v2.0 – http://localhost:${PORT}`);
    console.log('   Admin:        admin@gmail.com / admin123');
    console.log('   Klinitsist:   j.yusupov@caretrack.uz / j.yusupov');
    console.log('   Qabulxona:    receptionist / reception123');
    console.log('   Bemor:        bemor1 / bemor123\n');
  });

  // Initialize WebSocket service (socket.io)
  try {
    require('./src/sockets/socketService').init(server);
  } catch (e) {
    console.warn('Socket service not initialized:', e.message || e);
  }
}
module.exports = { start };

if (require.main === module) {
  start().catch(err => {
    console.error('Server ishga tushmadi:', err);
    process.exit(1);
  });
}
