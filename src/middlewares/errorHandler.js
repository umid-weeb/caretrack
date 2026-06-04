'use strict';

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err.stack || err.message);
  const status = err.status || 500;
  const message = err.message || 'Server xatosi';
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
