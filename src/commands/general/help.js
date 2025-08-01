import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all available commands')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('Get help for a specific command')
        .setRequired(false)),
  
  category: 'general',
  cooldown: 3,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'help', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const commandName = interaction.options.getString('command');
    const { client } = interaction;

    if (commandName) {
      // Show help for specific command
      const command = client.commands.get(commandName);
      
      if (!command) {
        return interaction.reply({
          content: `❌ Command \`${commandName}\` not found.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSecondary)
        .setTitle(`📖 Help: ${command.data.name}`)
        .setDescription(command.data.description)
        .addFields(
          { name: 'Category', value: command.category || 'Uncategorized', inline: true },
          { name: 'Cooldown', value: `${command.cooldown || 3} seconds`, inline: true }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      // Show all commands grouped by category
      const categories = {};
      
      for (const [name, command] of client.commands) {
        const category = command.category || 'Uncategorized';
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          name: command.data.name,
          description: command.data.description
        });
      }

      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSecondary)
        .setTitle('📚 Help Menu')
        .setDescription('Here are all the available commands:')
        .setFooter(embedStyle.footer)
        .setTimestamp();

      for (const [category, commands] of Object.entries(categories)) {
        const commandList = commands
          .map(cmd => `\`${cmd.name}\` - ${cmd.description}`)
          .join('\n');
        
        embed.addFields({
          name: `${getCategoryEmoji(category)} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
          value: commandList,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed] });
    }
  }
};

// Get emoji for category
function getCategoryEmoji(category) {
  const emojis = {
    general: '🔧',
    moderation: '🛡️',
    music: '🎵',
    dev: '⚙️',
    Uncategorized: '❓'
  };
  
  return emojis[category] || '📁';
} 