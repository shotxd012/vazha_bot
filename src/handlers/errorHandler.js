import { WebhookClient, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';
import { embedStyle } from '../config/embedStyle.js';
import { botConfig } from '../config/botConfig.js';

export class ErrorHandler {
  constructor() {
    this.webhook = null;
    this.initializeWebhook();
  }

  // Initialize webhook for error reporting
  initializeWebhook() {
    if (botConfig.errorHandling.webhookUrl) {
      try {
        this.webhook = new WebhookClient({ url: botConfig.errorHandling.webhookUrl });
        logger.info('Error webhook initialized');
      } catch (error) {
        logger.error('Failed to initialize error webhook:', error);
      }
    }
  }

  // Handle unhandled promise rejections
  async handleUnhandledRejection(error, client) {
    logger.error('Unhandled Promise Rejection:', error);
    
    const errorInfo = {
      type: 'Unhandled Promise Rejection',
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      client: {
        guilds: client?.guilds?.cache?.size || 0,
        users: client?.users?.cache?.size || 0,
        uptime: client?.uptime || 0
      }
    };

    await this.logError(errorInfo);
  }

  // Handle uncaught exceptions
  async handleUncaughtException(error, client) {
    logger.error('Uncaught Exception:', error);
    
    const errorInfo = {
      type: 'Uncaught Exception',
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      client: {
        guilds: client?.guilds?.cache?.size || 0,
        users: client?.users?.cache?.size || 0,
        uptime: client?.uptime || 0
      }
    };

    await this.logError(errorInfo);
  }

  // Handle command execution errors
  async handleCommandError(error, interaction, commandName) {
    logger.error(`Command Error in ${commandName}:`, error);
    
    const errorInfo = {
      type: 'Command Error',
      command: commandName,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      interaction: {
        userId: interaction?.user?.id,
        guildId: interaction?.guildId,
        channelId: interaction?.channelId,
        commandName: interaction?.commandName
      }
    };

    await this.logError(errorInfo);
    await this.sendErrorResponse(interaction, error);
  }

  // Handle event errors
  async handleEventError(error, eventName, client) {
    logger.error(`Event Error in ${eventName}:`, error);
    
    const errorInfo = {
      type: 'Event Error',
      event: eventName,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      client: {
        guilds: client?.guilds?.cache?.size || 0,
        users: client?.users?.cache?.size || 0,
        uptime: client?.uptime || 0
      }
    };

    await this.logError(errorInfo);
  }

  // Log error to webhook
  async logError(errorInfo) {
    if (!this.webhook) return;

    try {
      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorError)
        .setTitle(`🚨 ${errorInfo.type}`)
        .setDescription(`\`\`\`js\n${errorInfo.error}\n\`\`\``)
        .addFields(
          { name: 'Timestamp', value: errorInfo.timestamp, inline: true },
          { name: 'Type', value: errorInfo.type, inline: true }
        )
        .setTimestamp();

      if (errorInfo.command) {
        embed.addFields({ name: 'Command', value: errorInfo.command, inline: true });
      }

      if (errorInfo.event) {
        embed.addFields({ name: 'Event', value: errorInfo.event, inline: true });
      }

      if (errorInfo.interaction) {
        embed.addFields(
          { name: 'User ID', value: errorInfo.interaction.userId || 'N/A', inline: true },
          { name: 'Guild ID', value: errorInfo.interaction.guildId || 'N/A', inline: true }
        );
      }

      if (errorInfo.client) {
        embed.addFields(
          { name: 'Guilds', value: errorInfo.client.guilds.toString(), inline: true },
          { name: 'Users', value: errorInfo.client.users.toString(), inline: true },
          { name: 'Uptime', value: this.formatUptime(errorInfo.client.uptime), inline: true }
        );
      }

      if (errorInfo.stack) {
        const stackTrace = errorInfo.stack.length > 1000 
          ? errorInfo.stack.substring(0, 1000) + '...'
          : errorInfo.stack;
        embed.addFields({ name: 'Stack Trace', value: `\`\`\`js\n${stackTrace}\n\`\`\`` });
      }

      await this.webhook.send({ embeds: [embed] });
    } catch (webhookError) {
      logger.error('Failed to send error to webhook:', webhookError);
    }
  }

  // Send error response to user
  async sendErrorResponse(interaction, error) {
    if (!interaction) return;

    try {
      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorError)
        .setTitle('❌ An error occurred')
        .setDescription('Something went wrong while executing this command. The error has been logged.')
        .setTimestamp();

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (responseError) {
      logger.error('Failed to send error response:', responseError);
    }
  }

  // Format uptime for display
  formatUptime(ms) {
    if (!ms) return 'N/A';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Handle database errors
  async handleDatabaseError(error, operation) {
    logger.error(`Database Error in ${operation}:`, error);
    
    const errorInfo = {
      type: 'Database Error',
      operation,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    await this.logError(errorInfo);
  }

  // Handle API errors
  async handleAPIError(error, endpoint) {
    logger.error(`API Error for ${endpoint}:`, error);
    
    const errorInfo = {
      type: 'API Error',
      endpoint,
      error: error.message || error,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    await this.logError(errorInfo);
  }
}

// Create global error handler instance
export const errorHandler = new ErrorHandler(); 