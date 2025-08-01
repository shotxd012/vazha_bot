import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { logger } from '../utils/logger.js';

export const loadEvents = async (client, eventsPath) => {
  try {
    const eventFolders = await readdir(eventsPath);
    let totalEvents = 0;

    for (const folder of eventFolders) {
      const folderPath = join(eventsPath, folder);
      const eventFiles = await readdir(folderPath);
      
      for (const file of eventFiles) {
        if (extname(file) !== '.js') continue;
        
        const filePath = join(folderPath, file);
        
        try {
          const { default: event } = await import(filePath);
          
          if (!event.name || !event.execute) {
            logger.warn(`Event at ${filePath} is missing required properties`);
            continue;
          }

          // Set category based on folder name
          event.category = folder;
          
          // Register event listener
          if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
          } else {
            client.on(event.name, (...args) => event.execute(...args, client));
          }
          
          totalEvents++;
          logger.info(`Loaded event: ${event.name} (${folder})`);
        } catch (error) {
          logger.error(`Error loading event from ${filePath}:`, error);
        }
      }
    }
    
    logger.info(`Successfully loaded ${totalEvents} events`);
    return totalEvents;
  } catch (error) {
    logger.error('Error loading events:', error);
    throw error;
  }
};

// Handle interaction events
export const handleInteraction = async (interaction, client) => {
  try {
    if (interaction.isChatInputCommand()) {
      // Handle slash commands
      const { handleCommand } = await import('./commandHandler.js');
      await handleCommand(interaction);
    } else if (interaction.isAutocomplete()) {
      // Handle autocomplete interactions
      const command = client.commands.get(interaction.commandName);
      if (command && command.autocomplete) {
        await command.autocomplete(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      // Handle modal submissions
      const command = client.commands.get(interaction.customId.split('_')[0]);
      if (command && command.handleModal) {
        await command.handleModal(interaction);
      }
    } else if (interaction.isButton()) {
      // Handle button interactions
      const command = client.commands.get(interaction.customId.split('_')[0]);
      if (command && command.handleButton) {
        await command.handleButton(interaction);
      }
    } else if (interaction.isSelectMenu()) {
      // Handle select menu interactions
      const command = client.commands.get(interaction.customId.split('_')[0]);
      if (command && command.handleSelectMenu) {
        await command.handleSelectMenu(interaction);
      }
    }
  } catch (error) {
    logger.error('Error handling interaction:', error);
    
    const errorMessage = 'There was an error while processing this interaction!';
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true });
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  }
};

// Get event statistics
export const getEventStats = (client) => {
  const stats = {
    total: client.eventNames().length,
    byCategory: {}
  };

  // This would need to be tracked separately since events don't have categories in the client
  return stats;
};

// Reload a specific event
export const reloadEvent = async (client, eventName) => {
  try {
    // Remove existing listeners
    client.removeAllListeners(eventName);
    
    // Reload event (this would need to be implemented based on your file structure)
    logger.info(`Reloaded event: ${eventName}`);
    return true;
  } catch (error) {
    logger.error(`Error reloading event ${eventName}:`, error);
    return false;
  }
};

// Event error handler
export const handleEventError = (error, eventName, client) => {
  logger.error(`Error in event ${eventName}:`, error);
  
  // You can add additional error handling logic here
  // For example, sending error reports to a webhook
}; 