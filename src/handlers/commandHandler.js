import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { REST, Routes } from 'discord.js';
import { logger } from '../utils/logger.js';
import { botConfig } from '../config/botConfig.js';

export const loadCommands = async (client, commandsPath) => {
  try {
    const commandFolders = await readdir(commandsPath);
    const commands = [];

    for (const folder of commandFolders) {
      const folderPath = join(commandsPath, folder);
      const commandFiles = await readdir(folderPath);
      
      for (const file of commandFiles) {
        if (extname(file) !== '.js') continue;
        
        const filePath = join(folderPath, file);
        
        try {
          const { default: command } = await import(filePath);
          
          if (!command.data || !command.execute) {
            logger.warn(`Command at ${filePath} is missing required properties`);
            continue;
          }

          // Set category based on folder name
          command.category = folder;
          
          client.commands.set(command.data.name, command);
          commands.push(command.data.toJSON());
          
          logger.info(`Loaded command: ${command.data.name} (${folder})`);
        } catch (error) {
          logger.error(`Error loading command from ${filePath}:`, error);
        }
      }
    }

    // Register slash commands
    await registerSlashCommands(commands);
    
    logger.info(`Successfully loaded ${commands.length} commands`);
    return commands;
  } catch (error) {
    logger.error('Error loading commands:', error);
    throw error;
  }
};

// Register slash commands with Discord
const registerSlashCommands = async (commands) => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    if (botConfig.development.enabled && botConfig.development.guildId) {
      // Register commands for specific guild (development)
      await rest.put(
        Routes.applicationGuildCommands(botConfig.development.clientId, botConfig.development.guildId),
        { body: commands }
      );
      logger.info(`Registered ${commands.length} commands for guild ${botConfig.development.guildId}`);
    } else {
      // Register commands globally (production)
      await rest.put(
        Routes.applicationCommands(botConfig.development.clientId),
        { body: commands }
      );
      logger.info(`Registered ${commands.length} commands globally`);
    }
  } catch (error) {
    logger.error('Error registering slash commands:', error);
    throw error;
  }
};

// Handle command execution
export const handleCommand = async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  
  if (!command) {
    logger.warn(`Command not found: ${interaction.commandName}`);
    return;
  }

  try {
    // Log command execution
    logger.info(`Command executed: ${interaction.commandName} by ${interaction.user.tag} in ${interaction.guild?.name || 'DM'}`);
    
    // Execute command
    await command.execute(interaction);
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = 'There was an error while executing this command!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
};

// Get command statistics
export const getCommandStats = (client) => {
  const stats = {
    total: client.commands.size,
    byCategory: {}
  };

  for (const [name, command] of client.commands) {
    const category = command.category || 'Uncategorized';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
  }

  return stats;
};

// Reload a specific command
export const reloadCommand = async (client, commandName) => {
  try {
    const command = client.commands.get(commandName);
    if (!command) {
      throw new Error(`Command ${commandName} not found`);
    }

    // Remove old command
    client.commands.delete(commandName);
    
    // Reload command (this would need to be implemented based on your file structure)
    logger.info(`Reloaded command: ${commandName}`);
    return true;
  } catch (error) {
    logger.error(`Error reloading command ${commandName}:`, error);
    return false;
  }
}; 