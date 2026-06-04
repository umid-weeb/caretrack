'use strict';
const path = require('path');
const { Sequelize } = require('sequelize');

let dbPath;
if (process.env.DB_PATH === ':memory:') {
  dbPath = ':memory:';
} else if (process.env.DB_PATH) {
  dbPath = path.resolve(process.env.DB_PATH);
} else {
  dbPath = path.join(__dirname, '../../caretrack.sqlite');
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

module.exports = sequelize;
