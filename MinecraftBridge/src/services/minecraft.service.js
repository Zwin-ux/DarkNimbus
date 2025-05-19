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

    // Optionally, request initial metadata from the addon
    // socket.emit('minecraft:request_initial_data');
  }

  /**
   * Registers event listeners for a specific Minecraft addon socket.
   * @param {Socket} socket The addon's socket.
   */
  registerAddonEventListeners(socket) {
    // Specific, common events
    socket.on('minecraft:player_chat', (data) => this.handlePlayerChat(socket, data));
    socket.on('minecraft:player_join', (data) => this.handlePlayerJoin(socket, data));
    socket.on('minecraft:player_leave', (data) => this.handlePlayerLeave(socket, data));
    socket.on('minecraft:player_death', (data) => this.handlePlayerDeath(socket, data));
    socket.on('minecraft:achievement_unlocked', (data) => this.handleAchievementUnlocked(socket, data));

    // Generic event listener as a fallback or for custom events
    socket.on('minecraft:event', (data) => {
      this.handleGenericMinecraftEvent(socket, data);
    });

    // Listener for addon metadata if requested
    // socket.on('minecraft:initial_data_response', (data) => {
    //   this.updateAddonMetadata(socket, data);
    // });
  }

  /**
   * Handles truly generic or custom events from a Minecraft addon.
   * It's recommended for addons to use specific event names for common actions.
   * @param {Socket} socket The addon's socket.
   * @param {{type?: string, payload: any, [key: string]: any}} data The event data, expecting an optional 'type' for routing.
   */
  handleGenericMinecraftEvent(socket, data) {
    logger.info(`Received generic 'minecraft:event' from ${socket.id}: ${JSON.stringify(data)}`);
    // You could try to route based on data.type if present, or just log/ignore
    if (data.type) {
      logger.info(`Generic event has type: ${data.type}. Consider creating a specific handler if common.`);
      // Example: Emitting a generic bridge event that includes the type
      this.io.emit('bridge:minecraft_custom_event', { 
        sourceAddonId: socket.id,
        eventType: data.type,
        payload: data.payload || data, // Send full data if payload not distinct
        timestamp: new Date().toISOString()
      });
    } else {
      // If no type, just log or handle as truly opaque data
      logger.warn(`Generic 'minecraft:event' from ${socket.id} lacks a 'type' field for specific routing.`);
    }
  }

  /**
   * Handles player chat messages from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, message: string, world?: string, senderXUID?: string }} data
   */
  handlePlayerChat(socket, data) {
    if (!data.playerName || typeof data.message === 'undefined') {
      logger.warn(`Invalid player_chat data from ${socket.id}: ${JSON.stringify(data)}`);
      return;
    }
    logger.info(`Player chat from Addon ${socket.id} (World: ${data.world || 'N/A'}, Player: ${data.playerName}): ${data.message}`);
    this.io.emit('bridge:minecraft_chat_to_discord', { 
        sourceAddonId: socket.id,
        playerName: data.playerName,
        message: data.message,
        world: data.world,
        senderXUID: data.senderXUID, // Xbox User ID, if available
        timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles player join events from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, world?: string, playerXUID?: string }} data
   */
  handlePlayerJoin(socket, data) {
    if (!data.playerName) {
      logger.warn(`Invalid player_join data from ${socket.id}: ${JSON.stringify(data)}`);
      return;
    }
    logger.info(`Player join from Addon ${socket.id} (World: ${data.world || 'N/A'}, Player: ${data.playerName})`);
    this.io.emit('bridge:minecraft_player_join', {
      sourceAddonId: socket.id,
      playerName: data.playerName,
      world: data.world,
      playerXUID: data.playerXUID,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles player leave events from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, world?: string, playerXUID?: string, reason?: string }} data
   */
  handlePlayerLeave(socket, data) {
    if (!data.playerName) {
      logger.warn(`Invalid player_leave data from ${socket.id}: ${JSON.stringify(data)}`);
      return;
    }
    logger.info(`Player leave from Addon ${socket.id} (World: ${data.world || 'N/A'}, Player: ${data.playerName}, Reason: ${data.reason || 'N/A'})`);
    this.io.emit('bridge:minecraft_player_leave', {
      sourceAddonId: socket.id,
      playerName: data.playerName,
      world: data.world,
      playerXUID: data.playerXUID,
      reason: data.reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles player death events from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, world?: string, playerXUID?: string, killer?: string, message?: string }} data
   */
  handlePlayerDeath(socket, data) {
    if (!data.playerName) {
      logger.warn(`Invalid player_death data from ${socket.id}: ${JSON.stringify(data)}`);
      return;
    }
    logger.info(`Player death in Addon ${socket.id} (World: ${data.world || 'N/A'}, Player: ${data.playerName}, Killer: ${data.killer || 'N/A'})`);
    this.io.emit('bridge:minecraft_player_death', {
      sourceAddonId: socket.id,
      playerName: data.playerName,
      world: data.world,
      playerXUID: data.playerXUID,
      killer: data.killer, // Name of entity/player or cause
      deathMessage: data.message, // Full death message if available
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handles achievement unlocked events from a Minecraft addon.
   * @param {Socket} socket The addon's socket.
   * @param {{ playerName: string, world?: string, playerXUID?: string, achievementName: string, achievementDescription?: string }} data
   */
  handleAchievementUnlocked(socket, data) {
    if (!data.playerName || !data.achievementName) {
      logger.warn(`Invalid achievement_unlocked data from ${socket.id}: ${JSON.stringify(data)}`);
      return;
    }
    logger.info(`Achievement unlocked in Addon ${socket.id} (World: ${data.world || 'N/A'}, Player: ${data.playerName}, Achievement: ${data.achievementName})`);
    this.io.emit('bridge:minecraft_achievement_unlocked', {
      sourceAddonId: socket.id,
      playerName: data.playerName,
      world: data.world,
      playerXUID: data.playerXUID,
      achievementName: data.achievementName,
      achievementDescription: data.achievementDescription,
      timestamp: new Date().toISOString()
    });
  }

  // TODO: Consider adding a method to update addon metadata if needed
  // updateAddonMetadata(socket, metadata) {
  //   const addonEntry = this.connectedAddons.get(socket.id);
  //   if (addonEntry) { // addonEntry could be just the socket or an object { socket, metadata }
  //     // If you change connectedAddons to store objects:
  //     // addonEntry.metadata = { ...addonEntry.metadata, ...metadata };
  //     // logger.info(`Updated metadata for addon ${socket.id}: ${JSON.stringify(metadata)}`);
  //   } else {
  //     logger.warn(`Received metadata for unknown addon: ${socket.id}`);
  //   }
  // }


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
