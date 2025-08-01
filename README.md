# Vazha Bot

An advanced Discord bot built with discord.js v14 featuring modular architecture, MongoDB integration, and comprehensive error handling.

## Features

- 🎯 **Modular Command System** - Organized slash command handler with category support
- 📡 **Event Management** - Separate handlers for client and guild events
- 🗄️ **MongoDB Integration** - Mongoose ODM for data persistence
- 🎨 **Custom Embed System** - Consistent theming with Discord's design
- 🔄 **Rotating Status** - Dynamic bot presence updates
- 📝 **Advanced Logging** - Comprehensive logging utility
- ⚡ **Error Handling** - Custom error handler with webhook support
- 🔧 **Configuration Management** - Environment-based configuration

## Project Structure

```
src/
├── commands/          # Slash commands organized by category
├── events/           # Event handlers (client & guild)
├── handlers/         # Core handlers (commands, events, errors)
├── config/           # Configuration files
├── utils/            # Utility functions
└── index.js          # Main entry point
```

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vazha-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Fill in your Discord bot token and other required values

4. **Start the bot**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file with the following variables:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
MONGODB_URI=mongodb://localhost:27017/vazha_bot
BOT_PREFIX=!
NODE_ENV=development
ERROR_WEBHOOK_URL=optional_webhook_url
```

## Commands

The bot includes several sample commands:

- **General**: `ping`, `info`, `help`
- **Moderation**: `kick`, `ban`, `clear`
- **Music**: `play`, `skip`, `queue`
- **Developer**: `eval`, `reload`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details. 