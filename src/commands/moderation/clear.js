import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkPermissions } from '../../utils/checkPermissions.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear a specified number of messages')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  category: 'moderation',
  cooldown: 5,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'clear', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const amount = interaction.options.getInteger('amount');
    const { member, channel } = interaction;

    // Check if user has permission to manage messages
    if (!checkPermissions.userHasPermission(member, PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ You do not have permission to manage messages.',
        ephemeral: true
      });
    }

    // Check if bot has permission to manage messages
    if (!checkPermissions.botHasPermission(interaction.guild, PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({
        content: '❌ I do not have permission to manage messages.',
        ephemeral: true
      });
    }

    try {
      // Defer reply since bulk delete might take time
      await interaction.deferReply({ ephemeral: true });

      // Fetch messages and delete them
      const messages = await channel.messages.fetch({ limit: amount });
      const deletedMessages = await channel.bulkDelete(messages, true);

      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSuccess)
        .setTitle('🧹 Messages Cleared')
        .setDescription(`Successfully deleted **${deletedMessages.size}** messages.`)
        .addFields(
          { name: 'Channel', value: channel.name, inline: true },
          { name: 'Cleared by', value: member.user.tag, inline: true }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error clearing messages:', error);
      await interaction.editReply({
        content: '❌ Failed to clear messages. Messages older than 14 days cannot be deleted.',
        ephemeral: true
      });
    }
  }
}; 