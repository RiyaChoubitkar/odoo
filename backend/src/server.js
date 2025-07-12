import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/matches.js';
import messageRoutes from './routes/messages.js';
import courseRoutes from './routes/courses.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to all requests
app.use(limiter);

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/courses', courseRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Talent Trade Network API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      matches: '/api/matches',
      messages: '/api/messages',
      courses: '/api/courses'
    }
  });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userId) => {
    connectedUsers.set(userId, socket.id);
    socket.userId = userId;
    
    // Update user online status
    socket.emit('authenticated');
    console.log(`User ${userId} authenticated`);
  });

  // Handle joining match room
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`User joined match room: ${matchId}`);
  });

  // Handle leaving match room
  socket.on('leave-match', (matchId) => {
    socket.leave(`match-${matchId}`);
    console.log(`User left match room: ${matchId}`);
  });

  // Handle new message
  socket.on('send-message', (data) => {
    // Broadcast to match room
    socket.to(`match-${data.matchId}`).emit('new-message', data);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`match-${data.matchId}`).emit('user-typing', {
      userId: socket.userId,
      matchId: data.matchId
    });
  });

  // Handle stop typing
  socket.on('stop-typing', (data) => {
    socket.to(`match-${data.matchId}`).emit('user-stop-typing', {
      userId: socket.userId,
      matchId: data.matchId
    });
  });

  // Handle online status
  socket.on('set-online', () => {
    if (socket.userId) {
      socket.broadcast.emit('user-online', socket.userId);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      socket.broadcast.emit('user-offline', socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 