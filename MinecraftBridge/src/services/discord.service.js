// src/services/discord.service.js
import { logger } from '../utils/logger.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10'; // Using v10 for API consistency
// import { /* other discord.js or API related imports */ } from 'discord.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {import('socket.io').Server} IOServer
 */

class DiscordService {
  /** @type {IOServer} */
  io;
  /** @type {Map<string, Socket>} */
  connectedUsers; // Maps socket.id to socket for connected Discord users
  /** @type {REST | null} */
  discordApiClient = null;

  /**
   * @param {IOServer} ioInstance The Socket.IO server instance
   */
  constructor(ioInstance) {
    this.io = ioInstance;
    this.connectedUsers = new Map();
    this.minecraftCommandPrefix = process.env.MINECRAFT_COMMAND_PREFIX || '!mc'; // Command prefix
    if (process.env.DISCORD_BOT_TOKEN) {
      this.discordApiClient = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
      logger.info('DiscordService initialized with Bot Token.');
    } else {
      logger.warn('DiscordService initialized WITHOUT Bot Token. Some functionalities will be unavailable.');
    }
    logger.info('DiscordService initialized');
  }

  /**
   * Handles a new authenticated connection from a web client (Discord user).
   * @param {Socket} socket The authenticated socket of the Discord user.
   */
  handleUserConnection(socket) {
    if (!socket.user || !socket.user.userId) {
      logger.warn(`handleUserConnection called with invalid socket user data: ${socket.id}`);
      return;
    }
    this.connectedUsers.set(socket.id, socket);
    logger.info(`Discord user connected and registered: ${socket.user.userId} (Socket ID: ${socket.id})`);

    // Example: Send a welcome message or initial data to the user
    socket.emit('discord:bridge_connected', { message: 'Successfully connected to Nimbus8 Bridge.', userId: socket.user.userId });

    // Attach Discord-user-specific event listeners
    this.registerUserEventListeners(socket);
  }

  /**
   * Registers event listeners for a specific Discord user's socket.
   * @param {Socket} socket The user's socket.
   */
  registerUserEventListeners(socket) {
    socket.on('discord:send_command_to_minecraft', (data) => {
      this.handleSendCommandToMinecraft(socket, data);
    });

    socket.on('discord:request_minecraft_info', (data) => {
      this.handleRequestMinecraftInfo(socket, data);
    });

    // Listen for chat messages from Discord users to be relayed to Minecraft
    socket.on('discord:send_chat_to_minecraft', (data) => {
        this.handleSendChatToMinecraft(socket, data);
    });

    // Add more Discord-user-specific event listeners here
  }

  /**
   * Handles a request from a Discord user to send a command to Minecraft.
   * @param {Socket} socket The user's socket.
   * @param {{ command: string, payload: any, targetAddonId?: string }} data
   */
  handleSendCommandToMinecraft(socket, data) {
    const userId = socket.user?.userId;
    const username = socket.user?.username || 'DiscordUser'; // Get username from JWT

    if (!data.command) {
      logger.warn(`User ${userId} (Discord: ${username}) tried to send an empty command to Minecraft.`, data);
      // Optionally, send an error back to the client socket
      // socket.emit('discord:command_error', { message: 'Command cannot be empty.' });
      return;
    }

    logger.info(`User ${userId} (Discord: ${username}) sending structured command '${data.command}' to Minecraft.`);
    
    this.io.emit('bridge:command_to_minecraft_from_discord', {
        sourceUserId: userId,
        discordUsername: username, // Include Discord username
        command: data.command,
        payload: data.payload,
        targetAddonId: data.targetAddonId,
        timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles a request from a Discord user for Minecraft information.
   * @param {Socket} socket The user's socket.
   * @param {any} data The request data.
   */
  handleRequestMinecraftInfo(socket, data) {
    const userId = socket.user?.userId;
    logger.info(`User ${userId} requests Minecraft info: ${JSON.stringify(data)}`);
    // This would involve querying MinecraftService or specific addons
    // Example: minecraftService.getPlayersList(data.targetAddonId);
    // For now, emit an event for src/index.js or other services to handle
    this.io.emit('bridge:request_minecraft_info_from_discord', {
        sourceUserId: userId,
        requestType: data.type, // e.g., 'player_list', 'server_status'
        targetAddonId: data.targetAddonId,
        timestamp: new Date().toISOString()
    });
  }

  /**
   * Relays chat from a Discord user to Minecraft.
   * @param {Socket} socket The user's socket.
   * @param {{ message: string, targetAddonId?: string, targetWorld?: string }} data 
   */
  handleSendChatToMinecraft(socket, data) {
    const userId = socket.user?.userId;
    const username = socket.user?.username || 'DiscordUser'; // Get username from JWT

    if (!data.message || typeof data.message !== 'string') {
        logger.warn(`User ${userId} (Discord: ${username}) sent invalid chat data to Minecraft.`, data);
        return;
    }

    const messageContent = data.message.trim();
    const commandPrefixWithSpace = this.minecraftCommandPrefix + ' ';

    if (messageContent.startsWith(commandPrefixWithSpace)) {
        // This is a command
        const commandString = messageContent.substring(commandPrefixWithSpace.length).trim();
        const [command, ...argsArr] = commandString.split(' ');
        const args = argsArr.join(' '); // Pass arguments as a single string

        if (command) {
            logger.info(`User ${userId} (Discord: ${username}) sending chat command '${command}' with args '${args}' to Minecraft.`);
            this.io.emit('bridge:command_to_minecraft_from_discord', {
                sourceUserId: userId,
                discordUsername: username,
                command: command,
                payload: { arguments: args }, // Minecraft addon can parse this string
                targetAddonId: data.targetAddonId,
                timestamp: new Date().toISOString()
            });
        } else {
            logger.warn(`User ${userId} (Discord: ${username}) sent an empty command after prefix: ${messageContent}`);
            // Optionally send feedback to user: socket.emit('discord:command_error', { message: 'Empty command after prefix.' });
        }
    } else {
        // This is a plain chat message
        logger.info(`User ${userId} (Discord: ${username}) sending chat to Minecraft: "${messageContent}"`);
        this.io.emit('bridge:chat_to_minecraft_from_discord', {
            sourceUserId: userId,
            discordUsername: username, // Include Discord username
            message: messageContent,
            targetAddonId: data.targetAddonId,
            targetWorld: data.targetWorld,
            timestamp: new Date().toISOString()
        });
    }
  }

  /**
   * Sends a message to a Discord channel (requires bot token and permissions).
   * @param {string} channelId The ID of the Discord channel.
   * @param {string} content The message content.
   */
  async sendChannelMessage(channelId, content) {
    if (!this.discordApiClient) {
      logger.warn('Cannot send Discord channel message: Bot token not configured.');
      return false;
    }
    try {
      await this.discordApiClient.post(Routes.channelMessages(channelId), {
        body: { content },
      });
      logger.info(`Message sent to Discord channel ${channelId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send message to Discord channel ${channelId}: ${error.message || error}`);
      return false;
    }
  }
  
  // TODO: Implement OAuth2 flow methods (generateAuthUrl, exchangeCode, getUserInfo)
  // These will likely be called by Express route handlers in `src/routes/auth.routes.js`

  /**
   * Handles disconnection of a Discord user's socket.
   * @param {Socket} socket The disconnected socket.
   */
  handleClientDisconnect(socket) {
    if (this.connectedUsers.has(socket.id)) {
      const userId = socket.user?.userId || 'unknown';
      this.connectedUsers.delete(socket.id);
      logger.info(`Discord user disconnected and unregistered: ${userId} (Socket ID: ${socket.id})`);
    }
  }
}

export { DiscordService };
