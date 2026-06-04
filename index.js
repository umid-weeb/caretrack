'use strict';

// Root entry point to align with assignment requirement `index.js`
const { start } = require('./server');

start().catch(err => {
  console.error('Server ishga tushmadi (index):', err);
  process.exit(1);
});
