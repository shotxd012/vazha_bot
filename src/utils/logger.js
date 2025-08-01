import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom format for console output
const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

// Custom format for file output
const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.json()
);

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: fileFormat,
  transports: [
    // Console transport
    new transports.Console({
      format: consoleFormat
    }),
    
    // File transports
    new transports.File({
      filename: join(__dirname, '../../logs/error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    new transports.File({
      filename: join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new transports.File({
      filename: join(__dirname, '../../logs/exceptions.log')
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new transports.File({
      filename: join(__dirname, '../../logs/rejections.log')
    })
  ]
});

// Custom logging methods
export const customLogger = {
  info: (message, meta = {}) => logger.info(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
  
  // Command logging
  command: (commandName, userId, guildId) => {
    logger.info(`Command executed: ${commandName}`, {
      userId,
      guildId,
      timestamp: new Date().toISOString()
    });
  },
  
  // Event logging
  event: (eventName, data = {}) => {
    logger.info(`Event triggered: ${eventName}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  },
  
  // Error logging with context
  errorWithContext: (error, context = {}) => {
    logger.error(error.message, {
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    });
  }
};

export { logger }; 