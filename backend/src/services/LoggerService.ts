import winston from 'winston';
import path from 'path';
import config from '../config';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'ai-dnd-game' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    // File transport for production
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});

// Add file transport for specific log levels
if (config.server.nodeEnv === 'production') {
  logger.add(
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
    })
  );
}

// Create a stream for Morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
} as any;

export default logger;
