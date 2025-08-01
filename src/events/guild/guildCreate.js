import { EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { embedStyle } from '../../config/embedStyle.js';

export default {
  name: 'guildCreate',
  category: 'guild',
  
  async execute(guild, client) {
    logger.info(`Joined guild: ${guild.name} (${guild.id}) with ${guild.memberCount} members`);
    
    // Try to send welcome message to system channel or first available text channel
    try {
      const systemChannel = guild.systemChannel || 
        guild.channels.cache.find(channel => 
          channel.type === 0 && channel.permissionsFor(client.user).has('SendMessages')
        );
      
      if (systemChannel) {
        const embed = new EmbedBuilder()
          .setColor(embedStyle.colorSecondary)
          .setTitle('🎉 Thanks for adding Vazha Bot!')
          .setDescription('Hello! I\'m Vazha Bot, an advanced Discord bot built with discord.js v14.')
          .addFields(
            { name: 'Getting Started', value: 'Use `/help` to see all available commands', inline: false },
            { name: 'Support', value: 'If you need help, check out the documentation or contact support.', inline: false }
          )
          .setFooter(embedStyle.footer)
          .setTimestamp();
        
        await systemChannel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error(`Failed to send welcome message to guild ${guild.name}:`, error);
    }
    
    // Log guild information
    logger.info('Guild Information:', {
      id: guild.id,
      name: guild.name,
      owner: guild.ownerId,
      memberCount: guild.memberCount,
      channelCount: guild.channels.cache.size,
      roleCount: guild.roles.cache.size,
      createdAt: guild.createdAt
    });
  }
}; 