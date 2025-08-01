import { EmbedBuilder } from 'discord.js';
import { embedStyle } from '../config/embedStyle.js';

export class EmbedHelper {
  // Create a basic embed with default styling
  static createEmbed(options = {}) {
    const embed = new EmbedBuilder()
      .setColor(options.color || embedStyle.colorPrimary)
      .setTimestamp();
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.author) embed.setAuthor(options.author);
    
    // Add footer if enabled in config
    if (embedStyle.embedDefaults.footer) {
      embed.setFooter(embedStyle.footer);
    }
    
    return embed;
  }

  // Create a success embed
  static success(options = {}) {
    return this.createEmbed({
      color: embedStyle.colorSuccess,
      ...options
    });
  }

  // Create an error embed
  static error(options = {}) {
    return this.createEmbed({
      color: embedStyle.colorError,
      ...options
    });
  }

  // Create a warning embed
  static warning(options = {}) {
    return this.createEmbed({
      color: embedStyle.colorWarning,
      ...options
    });
  }

  // Create an info embed
  static info(options = {}) {
    return this.createEmbed({
      color: embedStyle.colorSecondary,
      ...options
    });
  }

  // Create a help embed
  static help(command, description, usage, examples = []) {
    const embed = this.info({
      title: `📖 Help: ${command}`,
      description: description
    });

    if (usage) {
      embed.addFields({ name: 'Usage', value: `\`${usage}\``, inline: false });
    }

    if (examples.length > 0) {
      const examplesText = examples.map(ex => `\`${ex}\``).join('\n');
      embed.addFields({ name: 'Examples', value: examplesText, inline: false });
    }

    return embed;
  }

  // Create a paginated embed
  static createPaginatedEmbed(items, itemsPerPage = 10, title = 'Results') {
    const pages = [];
    const totalPages = Math.ceil(items.length / itemsPerPage);

    for (let i = 0; i < totalPages; i++) {
      const start = i * itemsPerPage;
      const end = start + itemsPerPage;
      const pageItems = items.slice(start, end);

      const embed = this.info({
        title: `${title} (Page ${i + 1}/${totalPages})`,
        description: pageItems.join('\n')
      });

      pages.push(embed);
    }

    return pages;
  }

  // Create a confirmation embed
  static confirmation(action, target, reason = null) {
    const embed = this.success({
      title: '✅ Confirmation',
      description: `Successfully ${action} **${target}**`
    });

    if (reason) {
      embed.addFields({ name: 'Reason', value: reason, inline: false });
    }

    return embed;
  }

  // Create a permission error embed
  static permissionError(missingPermissions) {
    const formattedPermissions = missingPermissions
      .map(perm => `• ${perm}`)
      .join('\n');

    return this.error({
      title: '❌ Permission Denied',
      description: 'You do not have the required permissions to use this command.',
      fields: [
        { name: 'Missing Permissions', value: formattedPermissions, inline: false }
      ]
    });
  }

  // Create a cooldown embed
  static cooldown(remainingTime) {
    return this.warning({
      title: '⏰ Cooldown Active',
      description: `Please wait **${remainingTime}** before using this command again.`
    });
  }

  // Create a maintenance embed
  static maintenance(feature = 'This feature') {
    return this.warning({
      title: '🔧 Under Maintenance',
      description: `${feature} is currently under maintenance. Please try again later.`
    });
  }

  // Create a stats embed
  static stats(stats) {
    const embed = this.info({
      title: '📊 Statistics',
      description: 'Here are the current statistics:'
    });

    for (const [key, value] of Object.entries(stats)) {
      embed.addFields({ 
        name: key.charAt(0).toUpperCase() + key.slice(1), 
        value: value.toString(), 
        inline: true 
      });
    }

    return embed;
  }
} 