// src/middleware/socketAuth.middleware.js
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
// Assume we'll have a User model or service to fetch user details if needed
// import { UserService } from '../services/user.service.js'; 

export const socketAuthMiddleware = async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token) {
    logger.warn(`Socket connection attempt without token from ${socket.id}`);
    return next(new Error('Authentication error: Token not provided.'));
  }

  try {
    // For JWT-based auth (e.g., from a web client after Discord OAuth)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // Attach user information to the socket object
    // Example: Fetch full user details if needed
    // const userDetails = await UserService.findById(decoded.userId);
    // if (!userDetails) {
    //   return next(new Error('Authentication error: User not found.'));
    // }
    // socket.userDetails = userDetails;

    logger.info(`Socket authenticated for user: ${decoded.userId || 'unknown'} (ID: ${socket.id})`);
    return next();
  } catch (error) {
    // Handle JWT verification errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      logger.warn(`Socket JWT authentication failed for ${socket.id}: ${error.message}`);
      return next(new Error('Authentication error: Invalid or expired token.'));
    }

    // Fallback for other token types (e.g., API key for Minecraft client)
    // This part needs to be more specific based on how the Minecraft client will authenticate.
    // For now, let's assume a simple API key check for Minecraft clients.
    if (token === process.env.MINECRAFT_API_KEY) {
        // Potentially, we could identify the type of client (e.g. Minecraft vs Web User)
        socket.clientType = 'minecraft_addon';
        socket.isAuthenticatedAsAddon = true; 
        logger.info(`Socket authenticated as Minecraft Addon (ID: ${socket.id})`);
        return next();
    }
    
    logger.error(`Socket authentication error for ${socket.id}: ${error.message}`);
    return next(new Error('Authentication error: Could not verify token.'));
  }
};
