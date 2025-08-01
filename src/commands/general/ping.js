import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),
  
  category: 'general',
  cooldown: 3,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'ping', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const sent = await interaction.deferReply({ fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
      .setColor(embedStyle.colorSecondary)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `\`${latency}ms\``, inline: true },
        { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true }
      )
      .setFooter(embedStyle.footer)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}; 