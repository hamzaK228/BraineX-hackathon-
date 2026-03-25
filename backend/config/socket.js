import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';
import logger from '../config/logger.js';

let io;

/**
 * Initialize Socket.IO server
 */
export const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    socket.join(`role:${socket.userRole}`);

    // Handle events
    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      logger.info(`User ${socket.userId} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      logger.info(`User ${socket.userId} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });

    // Notify user of successful connection
    socket.emit('connected', {
      message: 'Connected to BraineX real-time updates',
      userId: socket.userId,
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

/**
 * Send notification to specific user
 */
export const notifyUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Send notification to all users with specific role
 */
export const notifyRole = (role, event, data) => {
  if (!io) return;
  io.to(`role:${role}`).emit(event, data);
};

/**
 * Broadcast to all connected users
 */
export const broadcast = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Send to specific room
 */
export const sendToRoom = (roomId, event, data) => {
  if (!io) return;
  io.to(roomId).emit(event, data);
};

export default {
  initializeSocketIO,
  notifyUser,
  notifyRole,
  broadcast,
  sendToRoom,
};
