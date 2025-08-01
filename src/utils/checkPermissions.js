import { PermissionsBitField } from 'discord.js';
import { logger } from './logger.js';

export const checkPermissions = {
  // Check if user has specific permissions
  userHasPermission: (member, permission) => {
    if (!member || !permission) return false;
    
    try {
      return member.permissions.has(permission);
    } catch (error) {
      logger.error('Error checking user permission:', error);
      return false;
    }
  },

  // Check if bot has specific permissions
  botHasPermission: (guild, permission) => {
    if (!guild || !permission) return false;
    
    try {
      const botMember = guild.members.me;
      return botMember.permissions.has(permission);
    } catch (error) {
      logger.error('Error checking bot permission:', error);
      return false;
    }
  },

  // Check if user has role
  userHasRole: (member, roleId) => {
    if (!member || !roleId) return false;
    
    try {
      return member.roles.cache.has(roleId);
    } catch (error) {
      logger.error('Error checking user role:', error);
      return false;
    }
  },

  // Check if user is admin
  isAdmin: (member) => {
    return checkPermissions.userHasPermission(member, PermissionsBitField.Flags.Administrator);
  },

  // Check if user is moderator (has manage messages)
  isModerator: (member) => {
    return checkPermissions.userHasPermission(member, PermissionsBitField.Flags.ManageMessages);
  },

  // Get missing permissions for bot
  getMissingBotPermissions: (guild, requiredPermissions) => {
    if (!guild || !requiredPermissions || !Array.isArray(requiredPermissions)) {
      return [];
    }

    try {
      const botMember = guild.members.me;
      const missingPermissions = [];

      for (const permission of requiredPermissions) {
        if (!botMember.permissions.has(permission)) {
          missingPermissions.push(permission);
        }
      }

      return missingPermissions;
    } catch (error) {
      logger.error('Error getting missing bot permissions:', error);
      return requiredPermissions;
    }
  },

  // Get missing permissions for user
  getMissingUserPermissions: (member, requiredPermissions) => {
    if (!member || !requiredPermissions || !Array.isArray(requiredPermissions)) {
      return [];
    }

    try {
      const missingPermissions = [];

      for (const permission of requiredPermissions) {
        if (!member.permissions.has(permission)) {
          missingPermissions.push(permission);
        }
      }

      return missingPermissions;
    } catch (error) {
      logger.error('Error getting missing user permissions:', error);
      return requiredPermissions;
    }
  },

  // Check if user can manage target user
  canManageUser: (executor, target) => {
    if (!executor || !target) return false;
    
    try {
      // Check if executor is admin
      if (checkPermissions.isAdmin(executor)) return true;
      
      // Check if executor has higher role than target
      const executorHighestRole = executor.roles.highest.position;
      const targetHighestRole = target.roles.highest.position;
      
      return executorHighestRole > targetHighestRole;
    } catch (error) {
      logger.error('Error checking if user can manage target:', error);
      return false;
    }
  },

  // Format permission names for display
  formatPermissionName: (permission) => {
    const permissionNames = {
      [PermissionsBitField.Flags.Administrator]: 'Administrator',
      [PermissionsBitField.Flags.ManageGuild]: 'Manage Server',
      [PermissionsBitField.Flags.ManageChannels]: 'Manage Channels',
      [PermissionsBitField.Flags.ManageMessages]: 'Manage Messages',
      [PermissionsBitField.Flags.ManageRoles]: 'Manage Roles',
      [PermissionsBitField.Flags.KickMembers]: 'Kick Members',
      [PermissionsBitField.Flags.BanMembers]: 'Ban Members',
      [PermissionsBitField.Flags.SendMessages]: 'Send Messages',
      [PermissionsBitField.Flags.EmbedLinks]: 'Embed Links',
      [PermissionsBitField.Flags.AttachFiles]: 'Attach Files',
      [PermissionsBitField.Flags.AddReactions]: 'Add Reactions',
      [PermissionsBitField.Flags.UseSlashCommands]: 'Use Slash Commands',
      [PermissionsBitField.Flags.ViewChannel]: 'View Channel',
      [PermissionsBitField.Flags.Connect]: 'Connect',
      [PermissionsBitField.Flags.Speak]: 'Speak',
      [PermissionsBitField.Flags.UseVAD]: 'Use Voice Activity Detection'
    };

    return permissionNames[permission] || permission;
  }
}; 