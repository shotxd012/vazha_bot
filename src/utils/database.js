import mongoose from 'mongoose';
import { logger } from './logger.js';
import { botConfig } from '../config/botConfig.js';

let isConnected = false;

export const connectDatabase = async () => {
  if (isConnected) {
    logger.info('Database already connected');
    return;
  }

  console.log('Connecting with MONGODB_URI:', process.env.MONGODB_URI);
  console.log('Connecting with botConfig.database.uri:', botConfig.database.uri);

  try {
    const connection = await mongoose.connect(botConfig.database.uri, {
      ...botConfig.database.options,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info('Successfully connected to MongoDB');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  if (!isConnected) {
    logger.info('Database not connected');
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Successfully disconnected from MongoDB');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB:', error);
    throw error;
  }
};

export const getConnectionStatus = () => {
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
}); 