const winston = require('winston');
const path = require('path');

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

winston.addColors(colors);

// Format for console (colorized, human-readable format)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

// Format for files (JSON format)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

const isDevelopment = process.env.NODE_ENV === 'development';

const transports = [
  new winston.transports.Console({
    level: isDevelopment ? 'debug' : 'info',
    format: consoleFormat
  }),
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: fileFormat
  }),
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    level: 'info',
    format: fileFormat
  })
];

const logger = winston.createLogger({
  levels,
  level: isDevelopment ? 'debug' : 'info',
  transports
});

module.exports = logger;
