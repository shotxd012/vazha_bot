import { config } from 'dotenv';

// Load environment variables
config();

export const botConfig = {
  // Bot information
  name: 'Vazha Bot',
  version: '1.0.0',
  description: 'An advanced Discord bot built with discord.js v14',
  
  // Bot settings
  prefix: process.env.BOT_PREFIX || '!',
  defaultCooldown: 3,
  
  // Permissions
  requiredPermissions: [
    'SendMessages',
    'EmbedLinks',
    'UseSlashCommands',
    'ViewChannel'
  ],
  
  // Status rotation
  statusRotation: {
    enabled: true,
    interval: 30000, // 30 seconds
    activities: [
      { name: 'servers', type: 3 }, // Watching
      { name: 'users', type: 3 }, // Watching
      { name: '!help for commands', type: 0 }, // Playing
      { name: 'discord.js v14', type: 0 } // Playing
    ]
  },
  
  // Database settings
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vazha_bot',
    options: {}
  },
  
  // Error handling
  errorHandling: {
    webhookUrl: process.env.ERROR_WEBHOOK_URL,
    logErrors: true,
    notifyOwner: true
  },
  
  // Development settings
  development: {
    enabled: process.env.NODE_ENV === 'development',
    guildId: process.env.GUILD_ID,
    clientId: process.env.CLIENT_ID
  }
}; 