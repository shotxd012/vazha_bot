import { Collection } from 'discord.js';
import { logger } from './logger.js';

export class CooldownManager {
  constructor() {
    this.cooldowns = new Collection();
  }

  // Add cooldown for a user
  addCooldown(userId, commandName, cooldownTime) {
    const key = `${userId}-${commandName}`;
    const expiresAt = Date.now() + cooldownTime * 1000;
    
    this.cooldowns.set(key, expiresAt);
    
    // Clean up expired cooldowns
    setTimeout(() => {
      this.cooldowns.delete(key);
    }, cooldownTime * 1000);
  }

  // Check if user is on cooldown
  isOnCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expiresAt = this.cooldowns.get(key);
    
    if (!expiresAt) return false;
    
    if (Date.now() > expiresAt) {
      this.cooldowns.delete(key);
      return false;
    }
    
    return true;
  }

  // Get remaining cooldown time
  getRemainingCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expiresAt = this.cooldowns.get(key);
    
    if (!expiresAt) return 0;
    
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  }

  // Format cooldown time for display
  formatCooldown(seconds) {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes !== 1 ? 's' : ''}${remainingSeconds > 0 ? ` ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}` : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''}${remainingMinutes > 0 ? ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
    }
  }

  // Clear cooldown for a user
  clearCooldown(userId, commandName) {
    const key = `${userId}-${commandName}`;
    this.cooldowns.delete(key);
  }

  // Clear all cooldowns for a user
  clearUserCooldowns(userId) {
    for (const [key] of this.cooldowns) {
      if (key.startsWith(`${userId}-`)) {
        this.cooldowns.delete(key);
      }
    }
  }

  // Clear all cooldowns
  clearAllCooldowns() {
    this.cooldowns.clear();
  }

  // Get cooldown statistics
  getCooldownStats() {
    const stats = {
      totalCooldowns: this.cooldowns.size,
      activeCooldowns: 0,
      expiredCooldowns: 0
    };

    const now = Date.now();
    
    for (const [key, expiresAt] of this.cooldowns) {
      if (now > expiresAt) {
        stats.expiredCooldowns++;
        this.cooldowns.delete(key);
      } else {
        stats.activeCooldowns++;
      }
    }

    return stats;
  }
}

// Create global cooldown manager instance
export const cooldownManager = new CooldownManager();

// Helper function to check and apply cooldown
export const checkCooldown = (interaction, commandName, cooldownTime = 3) => {
  const userId = interaction.user.id;
  
  if (cooldownManager.isOnCooldown(userId, commandName)) {
    const remaining = cooldownManager.getRemainingCooldown(userId, commandName);
    const formattedTime = cooldownManager.formatCooldown(remaining);
    
    return {
      onCooldown: true,
      remainingTime: remaining,
      formattedTime
    };
  }
  
  // Apply cooldown
  cooldownManager.addCooldown(userId, commandName, cooldownTime);
  
  return {
    onCooldown: false,
    remainingTime: 0,
    formattedTime: null
  };
}; 