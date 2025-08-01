import { logger } from '../../utils/logger.js';

export default {
  name: 'guildDelete',
  category: 'guild',
  
  async execute(guild, client) {
    logger.info(`Left guild: ${guild.name} (${guild.id})`);
    
    // Log guild information for analytics
    logger.info('Guild Leave Information:', {
      id: guild.id,
      name: guild.name,
      owner: guild.ownerId,
      memberCount: guild.memberCount,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      leftAt: new Date().toISOString()
    });
    
    // You could also clean up any guild-specific data from your database here
    // For example, removing guild settings, user data, etc.
    
    logger.info(`Bot is now serving ${client.guilds.cache.size} guilds`);
  }
}; 