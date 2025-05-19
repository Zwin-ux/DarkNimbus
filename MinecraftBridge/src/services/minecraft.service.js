// src/services/minecraft.service.js
import { logger } from '../utils/logger.js';

/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {import('socket.io').Server} IOServer
 */

class MinecraftService {
  /** @type {IOServer} */
  io;
  /** @type {Map<string, Socket>} */
  connectedAddons; // Maps socket.id to socket for connected Minecraft addons

  /**
   * @param {IOServer} io The Socket.IO server instance
   */
  constructor(ioInstance) {
    this.io = ioInstance;
    this.connectedAddons = new Map();
    logger.info('MinecraftService initialized');
  }

  /**
   * Handles a new authenticated connection from a Minecraft addon.
   * @param {Socket} socket The authenticated socket of the Minecraft addon.
   */
  handleAddonConnection(socket) {
    if (socket.clientType !== 'minecraft_addon' || !socket.isAuthenticatedAsAddon) {
      logger.warn(`handleAddonConnection called with non-addon socket: ${socket.id}`);
      return;
    }
    this.connectedAddons.set(socket.id, socket);
    logger.info(`Minecraft Addon connected and registered: ${socket.id}`);

    // Example: Send a welcome message or initial config to the addon
    socket.emit('minecraft:bridge_connected', { message: 'Successfully connected to Nimbus8 Bridge.' });

    // Attach Minecraft-specific event listeners
    this.registerAddonEventListeners(socket);
  }

  /**
   * Registers event listeners for a specific Minecraft addon socket.
   * @param {Socket} socket The addon's socket.
   */
  registerAddonEventListeners(socket) {
    socket.on('minecraft:event', (data) => {
      this.handleMinecraftEvent(socket, data);
    });

    socket.on('minecraft:player_chat', (data) => {
      this.handlePlayerChat(socket, data);
    });

    // Add more Minecraft-specific event listeners here
    // e.g., socket.on('minecraft:player_join', (data) => { ... });
    // e.g., socket.on('minecraft:player_leave', (data) => { ... });
  }

  /**
   * Handles generic events from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {any} data The event data.
   */
  handleMinecraftEvent(socket, data) {
    logger.info(`Received 'minecraft:event' from ${socket.id}: ${JSON.stringify(data)}`);
    // Example: Relay this event to Discord or other services
    // this.io.to('discord_users_room').emit(' relayed_mc_event', { addonId: socket.id, event: data });
    
    // Potentially, broadcast to other connected addons (if applicable)
    // socket.broadcast.to('minecraft_addons_room').emit('addon_event', { from: socket.id, data });
  }

  /**
   * Handles player chat messages from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, message: string, world?: string }} data
   */
  handlePlayerChat(socket, data) {
    logger.info(`Player chat from ${socket.id} [${data.playerName}]: ${data.message}`);
    // Example: Relay chat to Discord
    // This would typically involve a DiscordService
    // discordService.sendChannelMessage(`[MC - ${data.playerName}]: ${data.message}`);
    this.io.emit('bridge:minecraft_chat_to_discord', { 
        sourceAddonId: socket.id, 
        playerName: data.playerName, 
        message: data.message,
        world: data.world,
        timestamp: new Date().toISOString()
    });
  }

  /**
   * Sends a command to a specific Minecraft addon or all addons.
   * @param {string} command The command to send.
   * @param {any} payload The data payload for the command.
   * @param {string} [targetSocketId] Optional. If provided, sends only to this addon. Otherwise, broadcasts.
   */
  sendCommandToMinecraft(command, payload, targetSocketId) {
    if (targetSocketId && this.connectedAddons.has(targetSocketId)) {
      const targetSocket = this.connectedAddons.get(targetSocketId);
      targetSocket.emit(`minecraft:command:${command}`, payload);
      logger.info(`Sent command '${command}' to addon ${targetSocketId}`);
    } else if (!targetSocketId) {
      // Broadcast to all connected addons
      // this.io.to('minecraft_addons_room').emit(`minecraft:command:${command}`, payload);
      this.connectedAddons.forEach(addonSocket => {
        addonSocket.emit(`minecraft:command:${command}`, payload);
      });
      logger.info(`Broadcasted command '${command}' to all connected addons`);
    } else {
      logger.warn(`Attempted to send command to unknown or disconnected addon: ${targetSocketId}`);
    }
  }

  /**
   * Handles disconnection of a Minecraft addon.
   * @param {Socket} socket The disconnected socket.
   */
  handleClientDisconnect(socket) {
    if (this.connectedAddons.has(socket.id)) {
      this.connectedAddons.delete(socket.id);
      logger.info(`Minecraft Addon disconnected and unregistered: ${socket.id}`);
    }
  }
}

export { MinecraftService };
