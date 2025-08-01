import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedStyle } from '../../config/embedStyle.js';
import { checkCooldown } from '../../utils/cooldown.js';

export default {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript code (Developer only)')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('JavaScript code to evaluate')
        .setRequired(true)),
  
  category: 'dev',
  cooldown: 10,
  
  async execute(interaction) {
    // Check cooldown
    const cooldown = checkCooldown(interaction, 'eval', this.cooldown);
    if (cooldown.onCooldown) {
      return interaction.reply({
        content: `⏰ Please wait **${cooldown.formattedTime}** before using this command again.`,
        ephemeral: true
      });
    }

    // Check if user is the bot owner or has admin permissions
    const isOwner = interaction.user.id === process.env.OWNER_ID;
    const isAdmin = interaction.member.permissions.has('Administrator');
    
    if (!isOwner && !isAdmin) {
      return interaction.reply({
        content: '❌ This command is restricted to bot owners and administrators only.',
        ephemeral: true
      });
    }

    const code = interaction.options.getString('code');
    
    try {
      await interaction.deferReply({ ephemeral: true });
      
      // Create a safe evaluation environment
      const startTime = Date.now();
      const result = eval(code);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Format the result
      let output;
      let type = typeof result;
      
      if (result === null) {
        output = 'null';
      } else if (result === undefined) {
        output = 'undefined';
      } else if (typeof result === 'object') {
        output = JSON.stringify(result, null, 2);
      } else {
        output = String(result);
      }
      
      // Truncate output if too long
      if (output.length > 1000) {
        output = output.substring(0, 1000) + '...';
      }
      
      const embed = new EmbedBuilder()
        .setColor(embedStyle.colorSuccess)
        .setTitle('⚙️ Code Evaluation')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\``, inline: false },
          { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\``, inline: false },
          { name: 'Type', value: type, inline: true },
          { name: 'Execution Time', value: `${executionTime}ms`, inline: true }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(embedStyle.colorError)
        .setTitle('❌ Evaluation Error')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\``, inline: false },
          { name: 'Error', value: `\`\`\`js\n${error.message}\n\`\`\``, inline: false }
        )
        .setFooter(embedStyle.footer)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  }
}; 