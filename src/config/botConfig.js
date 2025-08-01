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
      { name: '4', type: 3 }, // Watching
      { name: '3', type: 3 }, // Watching
      { name: '2', type: 0 }, // Playing
      { name: '1', type: 0 } // Playing
    ]
  },
  
  // Database settings
  database: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://vazha:1234@cluster0.k1ozo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
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