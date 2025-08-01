import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkPermissions } from '../../utils/checkPermissions.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking the user')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  category: 'moderation',
  cooldown: 5,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'kick', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const { member, guild } = interaction;

    // Check if user is trying to kick themselves
    if (targetUser.id === member.id) {
      return interaction.reply({
        content: '❌ You cannot kick yourself!',
        ephemeral: true
      });
    }

    // Check if user is trying to kick the bot
    if (targetUser.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ You cannot kick me!',
        ephemeral: true
      });
    }

    // Check if target user is in the guild
    const targetMember = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!targetMember) {
      return interaction.reply({
        content: '❌ That user is not a member of this server.',
        ephemeral: true
      });
    }

    // Check if executor has permission to kick
    if (!checkPermissions.userHasPermission(member, PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: '❌ You do not have permission to kick members.',
        ephemeral: true
      });
    }

    // Check if bot has permission to kick
    if (!checkPermissions.botHasPermission(guild, PermissionFlagsBits.KickMembers)) {
      return interaction.reply({
        content: '❌ I do not have permission to kick members.',
        ephemeral: true
      });
    }

    // Check if executor can manage the target user
    if (!checkPermissions.canManageUser(member, targetMember)) {
      return interaction.reply({
        content: '❌ You cannot kick this user due to role hierarchy.',
        ephemeral: true
      });
    }

    try {
      await targetMember.kick(reason);

      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSuccess)
        .setTitle('👢 User Kicked')
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: 'User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: 'Kicked by', value: `${member.user.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      logger.error('Error kicking user:', error);
      await interaction.reply({
        content: '❌ Failed to kick the user. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
}; 