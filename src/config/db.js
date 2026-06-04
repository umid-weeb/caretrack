'use strict';
const path = require('path');
const { Sequelize } = require('sequelize');

// Prefer a remote DB_URL when available, otherwise fall back to local SQLite.
const rawDbUrl = process.env.DB_URL;
let sequelize;

if (rawDbUrl) {
  const dbUrl = rawDbUrl.replace(/^postgresql:\/\//i, 'postgres://');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  let dbPath;
  if (process.env.DB_PATH === ':memory:') {
    dbPath = ':memory:';
  } else if (process.env.DB_PATH) {
    dbPath = path.resolve(process.env.DB_PATH);
  } else {
    dbPath = path.join(__dirname, '../../caretrack.sqlite');
  }

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false,
  });
}

module.exports = sequelize;
