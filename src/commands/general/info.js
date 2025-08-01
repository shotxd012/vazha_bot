import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkCooldown } from '../../utils/cooldown.js';
import { getConnectionStatus } from '../../utils/database.js';

export default {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Display bot and server information'),
  
  category: 'general',
  cooldown: 5,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'info', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const { client, guild } = interaction;
    const dbStatus = getConnectionStatus();
    
    // Calculate uptime
    const uptime = client.uptime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const embed = new EmbedBuilder()
      .setColor(embedStyle.colorSecondary)
      .setTitle('🤖 Bot Information')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: 'Bot Name', value: client.user.tag, inline: true },
        { name: 'Bot ID', value: client.user.id, inline: true },
        { name: 'Created At', value: `<t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Uptime', value: uptimeString, inline: true },
        { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
        { name: 'Users', value: client.users.cache.size.toString(), inline: true },
        { name: 'Database', value: dbStatus.isConnected ? '🟢 Connected' : '🔴 Disconnected', inline: true },
        { name: 'Node.js', value: process.version, inline: true },
        { name: 'Discord.js', value: 'v14.14.1', inline: true }
      )
      .setFooter(embedStyle.footer)
      .setTimestamp();

    if (guild) {
      embed.addFields(
        { name: 'Server Name', value: guild.name, inline: true },
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Members', value: guild.memberCount.toString(), inline: true },
        { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
      );
    }

    await interaction.reply({ embeds: [embed] });
  }
}; 