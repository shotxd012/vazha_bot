import { logger } from '../../utils/logger.js';
import { handleCommand } from '../../handlers/commandHandler.js';

export default {
  name: 'interactionCreate',
  category: 'client',
  
  async execute(interaction, client) {
    try {
      // Handle slash commands
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
        return;
      }
      
      // Handle other interaction types (buttons, select menus, etc.)
      if (interaction.isButton()) {
        // Handle button interactions
        logger.info(`Button interaction: ${interaction.customId} by ${interaction.user.tag}`);
        return;
      }
      
      if (interaction.isStringSelectMenu()) {
        // Handle select menu interactions
        logger.info(`Select menu interaction: ${interaction.customId} by ${interaction.user.tag}`);
        return;
      }
      
      if (interaction.isModalSubmit()) {
        // Handle modal submit interactions
        logger.info(`Modal submit interaction: ${interaction.customId} by ${interaction.user.tag}`);
        return;
      }
      
      if (interaction.isAutocomplete()) {
        // Handle autocomplete interactions
        logger.info(`Autocomplete interaction: ${interaction.commandName} by ${interaction.user.tag}`);
        return;
      }
      
    } catch (error) {
      logger.error('Error handling interaction:', error);
      
      const errorMessage = 'There was an error while processing your request.';
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: errorMessage, ephemeral: true });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  }
}; 