import { Server as SocketIO } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import config from './config.js';

let io;

export const setIO = (instance) => {
  io = instance;
};

export const initializeSocket = (server) => {
  if (!io) {
    io = new SocketIO(server, {
      cors: {
        origin: config.FRONTEND_URLS,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });
  }

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export default {
  initializeSocket,
  getIO,
  setIO,
};
