import { logger } from '../../utils/logger.js';
import { getConnectionStatus } from '../../utils/database.js';

export default {
  name: 'ready',
  once: true,
  category: 'client',
  
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    logger.info(`Bot is ready! Serving ${client.guilds.cache.size} guilds and ${client.users.cache.size} users`);
    
    // Log database connection status
    const dbStatus = getConnectionStatus();
    if (dbStatus.isConnected) {
      logger.info(`Database connected: ${dbStatus.host}/${dbStatus.name}`);
    } else {
      logger.warn('Database not connected');
    }
    
    // Set initial presence
    client.user.setActivity('!help for commands', { type: 0 });
    
    // Log bot information
    logger.info('Bot Information:', {
      id: client.user.id,
      tag: client.user.tag,
      createdAt: client.user.createdAt,
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size
    });
  }
}; 