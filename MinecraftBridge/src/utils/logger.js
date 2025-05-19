// src/utils/logger.js
import winston from 'winston';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0 && metadata.constructor === Object && Object.keys(metadata).filter(key => key !== 'level' && key !== 'message' && key !== 'timestamp').length > 0) {
    msg += ` ${JSON.stringify(metadata, (key, value) => (key === 'level' || key === 'message' || key === 'timestamp') ? undefined : value )}`;
  }
  return msg;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    align(),
    logFormat
  ),
  transports: [new winston.transports.Console()],
  exceptionHandlers: [
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.Console()
  ]
});

// Create a stream for morgan or other http loggers
export const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};
