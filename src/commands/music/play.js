import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Song name or YouTube URL')
        .setRequired(true)),
  
  category: 'music',
  cooldown: 3,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'play', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const query = interaction.options.getString('query');
    const { member } = interaction;

    // Check if user is in a voice channel
    const voiceChannel = member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ You need to be in a voice channel to use this command!',
        ephemeral: true
      });
    }

    // Check if bot has permission to join and speak
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({
        content: '❌ I need permission to join and speak in your voice channel!',
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSecondary)
        .setTitle('🎵 Music Player')
        .setDescription(`Searching for: **${query}**`)
        .addFields(
          { name: 'Requested by', value: member.user.tag, inline: true },
          { name: 'Channel', value: voiceChannel.name, inline: true }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Note: This is a placeholder implementation
      // You would need to integrate with a music library like @discordjs/voice and ytdl-core
      // or use a service like YouTube Data API to actually play music
      
      // For now, we'll just acknowledge the request
      setTimeout(async () => {
        const updatedEmbed = new EmbedBuilder()
          .setColor(embedStyle.colorSuccess)
          .setTitle('🎵 Music Player')
          .setDescription(`**Music functionality coming soon!**\n\nQuery: **${query}**`)
          .addFields(
            { name: 'Status', value: '⏳ Under Development', inline: true },
            { name: 'Requested by', value: member.user.tag, inline: true }
          )
          .setFooter(embedStyle.footer)
          .setTimestamp();

        await interaction.editReply({ embeds: [updatedEmbed] });
      }, 2000);

    } catch (error) {
      logger.error('Error in play command:', error);
      await interaction.editReply({
        content: '❌ An error occurred while processing your request.',
        ephemeral: true
      });
    }
  }
}; 