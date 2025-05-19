// src/index.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { socketAuthMiddleware } from './middleware/socketAuth.middleware.js';
import { MinecraftService } from './services/minecraft.service.js';
import { DiscordService } from './services/discord.service.js';
import authRouter from './routes/auth.routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Consider more restrictive CORS settings for production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*', // Restrict this in production
    methods: ['GET', 'POST']
  }
});

// Apply WebSocket authentication middleware
io.use(socketAuthMiddleware);

// Instantiate services
const minecraftService = new MinecraftService(io);
const discordService = new DiscordService(io);

// WebSocket connection handler (runs only for authenticated sockets)
io.on('connection', (socket) => {
  logger.info(`Authenticated client connected: ${socket.id} (Type: ${socket.clientType || 'user'}, UserID: ${socket.user?.userId || 'N/A'})`);

  // Delegate connection handling to appropriate service
  if (socket.clientType === 'minecraft_addon' && socket.isAuthenticatedAsAddon) {
    minecraftService.handleAddonConnection(socket);
  } else if (socket.user && socket.user.userId) {
    discordService.handleUserConnection(socket);
  } else {
    logger.warn(`Authenticated socket ${socket.id} did not match known client types. User: ${JSON.stringify(socket.user)}, ClientType: ${socket.clientType}`);
    socket.disconnect(true); // Or handle as an error
  }

  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}: ${error.message}`);
  });

  socket.on('disconnect', (reason) => {
    logger.info(`Authenticated client disconnected: ${socket.id}. Reason: ${reason}`);
    // Delegate disconnection handling
    if (socket.clientType === 'minecraft_addon') {
      minecraftService.handleClientDisconnect(socket);
    } else if (socket.user) {
      discordService.handleClientDisconnect(socket);
    }
  });
});

// Bridge event listeners for inter-service communication
// These listeners are on the main 'io' object if services emit globally, or on 'socket' if services emit on specific sockets.
// For simplicity, using 'io' for broad bridge events emitted by services.

// Example: Relay Minecraft chat to a specific Discord channel
io.on('bridge:minecraft_chat_to_discord', (data) => {
  // TODO: Make CHAT_RELAY_DISCORD_CHANNEL_ID configurable via .env
  const discordChannelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID;
  if (discordChannelId && data.playerName && data.message) {
    const message = `[MC/${data.world || 'World'}] **${data.playerName}**: ${data.message}`;
    discordService.sendChannelMessage(discordChannelId, message)
      .catch(err => logger.error(`Failed to relay MC chat to Discord: ${err.message}`));
  } else {
    logger.warn('Cannot relay MC chat to Discord: Missing channel ID, player name, or message.', data);
  }
});

// Example: Relay Discord chat to Minecraft (broadcast or target specific addon/world)
io.on('bridge:chat_to_minecraft_from_discord', (data) => {
  // TODO: Add logic to determine target (e.g., all addons, specific world)
  if (data.message) {
    const commandPayload = {
      // Assuming Discord username is available in socket.user or passed in data
      sender: data.discordUsername || data.sourceUserId || 'DiscordUser',
      message: data.message
    };
    // This command name ('display_chat_message') must be something your Minecraft addon understands
    minecraftService.sendCommandToMinecraft('display_chat_message', commandPayload, data.targetAddonId);
  } else {
    logger.warn('Cannot relay Discord chat to MC: Missing message.', data);
  }
});

// Example: Handle command from Discord to Minecraft
io.on('bridge:command_to_minecraft_from_discord', (data) => {
  if (data.command && data.payload) {
    minecraftService.sendCommandToMinecraft(data.command, data.payload, data.targetAddonId);
  } else {
    logger.warn('Cannot process command to MC from Discord: Missing command or payload.', data);
  }
});

// Handle player join events from Minecraft
io.on('bridge:minecraft_player_join', (data) => {
  const channelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID; // Or a dedicated announcements channel
  if (channelId && data.playerName) {
    const worldInfo = data.world ? ` (World: ${data.world})` : '';
    const message = `✅ **${data.playerName}** joined the Minecraft server${worldInfo}.`;
    discordService.sendChannelMessage(channelId, message)
      .catch(err => logger.error(`Failed to announce MC player join to Discord: ${err.message}`));
  } else {
    logger.warn('Cannot announce MC player join: Missing channel ID or player name.', data);
  }
});

// Handle player leave events from Minecraft
io.on('bridge:minecraft_player_leave', (data) => {
  const channelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID;
  if (channelId && data.playerName) {
    const worldInfo = data.world ? ` (World: ${data.world})` : '';
    const reasonInfo = data.reason ? ` (Reason: ${data.reason})` : '';
    const message = `👋 **${data.playerName}** left the Minecraft server${worldInfo}${reasonInfo}.`;
    discordService.sendChannelMessage(channelId, message)
      .catch(err => logger.error(`Failed to announce MC player leave to Discord: ${err.message}`));
  } else {
    logger.warn('Cannot announce MC player leave: Missing channel ID or player name.', data);
  }
});

// Handle player death events from Minecraft
io.on('bridge:minecraft_player_death', (data) => {
  const channelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID;
  if (channelId && data.playerName) {
    const worldInfo = data.world ? ` (World: ${data.world})` : '';
    let message = `💀 **${data.playerName}** died${worldInfo}.`;
    if(data.deathMessage) {
        message = `💀 ${data.deathMessage.replace(data.playerName, `**${data.playerName}**`)}${worldInfo}`;
    } else if (data.killer) {
        message = `💀 **${data.playerName}** was slain by **${data.killer}**${worldInfo}.`;
    }
    discordService.sendChannelMessage(channelId, message)
      .catch(err => logger.error(`Failed to announce MC player death to Discord: ${err.message}`));
  } else {
    logger.warn('Cannot announce MC player death: Missing channel ID or player name.', data);
  }
});

// Handle achievement unlocked events from Minecraft
io.on('bridge:minecraft_achievement_unlocked', (data) => {
  const channelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID;
  if (channelId && data.playerName && data.achievementName) {
    const worldInfo = data.world ? ` (World: ${data.world})` : '';
    const description = data.achievementDescription ? ` (${data.achievementDescription})` : '';
    const message = `🏆 **${data.playerName}** unlocked achievement: **${data.achievementName}**${description}${worldInfo}!`;
    discordService.sendChannelMessage(channelId, message)
      .catch(err => logger.error(`Failed to announce MC achievement to Discord: ${err.message}`));
  } else {
    logger.warn('Cannot announce MC achievement: Missing channel ID, player name, or achievement name.', data);
  }
});

// Handle custom/generic Minecraft events
io.on('bridge:minecraft_custom_event', (data) => {
    const channelId = process.env.CHAT_RELAY_DISCORD_CHANNEL_ID; // Or a dedicated debug/event channel
    if (channelId && data.eventType && data.payload) {
        const message = `[MC Custom Event/${data.eventType}${data.world ? '/' + data.world : ''}] ${JSON.stringify(data.payload)}`;
        // Keep custom event messages more raw, or format as needed
        discordService.sendChannelMessage(channelId, message)
            .catch(err => logger.error(`Failed to relay MC custom event to Discord: ${err.message}`));
    } else {
        logger.warn('Cannot relay MC custom event: Missing channel ID, event type, or payload.', data);
    }
});

// Example: Handle request for Minecraft info from Discord
io.on('bridge:request_minecraft_info_from_discord', async (data) => {
  logger.info(`Received request for MC info from Discord user ${data.sourceUserId}: ${data.requestType}`);
  // This is a placeholder. Actual implementation would query MinecraftService, 
  // which might need to communicate with addons and then respond.
  // For instance, if MinecraftService could get a player list:
  // const playerList = await minecraftService.getPlayerList(data.targetAddonId);
  // Then send this back to the requesting user's socket (would require socketId mapping or rooms)
  // For now, logging the request.
  // Example direct response if the requesting user's socket could be identified:
  // const requestingUserSocket = discordService.connectedUsers.get(socketIdOfRequestingUser);
  // if (requestingUserSocket) requestingUserSocket.emit('minecraft:info_response', { type: data.requestType, data: playerList });
});


// API Routes
app.use('/api/auth', authRouter); // Mount the auth routes

// Basic HTTP routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler for Express
app.use((err, req, res, next) => {
  logger.error(`HTTP Error: ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`To connect a client, ensure it sends a token in 'socket.handshake.auth.token' or 'socket.handshake.query.token'.`);
  logger.info(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET}`);
  logger.info(`MINECRAFT_API_KEY loaded: ${!!process.env.MINECRAFT_API_KEY}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed.');
    io.close(() => {
      logger.info('Socket.IO server closed.');
      // Add any other cleanup here (e.g., database connections)
      process.exit(0);
    });
  });

  // Force shutdown if graceful fails after timeout
  setTimeout(() => {
    logger.warn('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, exit or attempt to recover
});

export { app, server, io };
