const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Request error occurred', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : err.message;

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
