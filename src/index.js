import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { connectDatabase } from './utils/database.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './handlers/errorHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { loadCommands } from './handlers/commandHandler.js';
import { botConfig } from './config/botConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Set up error handling
process.on('unhandledRejection', (error) => {
  errorHandler.handleUnhandledRejection(error, client);
});

process.on('uncaughtException', (error) => {
  errorHandler.handleUncaughtException(error, client);
});

// Bot ready event
client.once('ready', async () => {
  logger.info(`Logged in as ${client.user.tag}`);
  
  // Set up rotating presence
  setInterval(() => {
    const activities = [
      { name: `${client.guilds.cache.size} servers`, type: 3 }, // Watching
      { name: `${client.users.cache.size} users`, type: 3 }, // Watching
      { name: '!help for commands', type: 0 }, // Playing
      { name: 'discord.js v14', type: 0 } // Playing
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    client.user.setActivity(activity.name, { type: activity.type });
  }, 30000); // Change every 30 seconds
  
  logger.info('Bot is ready!');
});

// Initialize bot
async function initializeBot() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    logger.info('Connected to MongoDB');
    
    // Load commands
    await loadCommands(client, join(__dirname, 'commands'));
    logger.info('Commands loaded successfully');
    
    // Load events
    await loadEvents(client, join(__dirname, 'events'));
    logger.info('Events loaded successfully');
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    
  } catch (error) {
    logger.error('Failed to initialize bot:', error);
    process.exit(1);
  }
}

// Start the bot
initializeBot(); 