const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { initSocketHandler } = require('./sockets/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');
const tableRoutes = require('./routes/tableRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize express app & HTTP server
const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// CORS Origin Resolver for Localhost, LAN devices, Vercel, and Render deployments
const isOriginAllowed = (origin) => {
  if (!origin) return true; // Mobile apps, curl, server-to-server

  // Local development hostnames
  if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com')
  ) {
    return true;
  }

  // Local Area Network (LAN) IP patterns (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const lanPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
  if (lanPattern.test(origin)) {
    return true;
  }

  if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
    return true;
  }

  // In development, allow all origins
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for easy demo setup
      }
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

initSocketHandler(io);

// Render Keep-Alive & Health Ping Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'DineFlow Backend & Socket.io Server Active',
  });
});

// API Root Information
app.get('/', (req, res) => {
  res.json({
    message: '🍽️ DineFlow REST API & Real-Time Engine Active',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[DineFlow Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`[DineFlow Server] Health Check: http://localhost:${PORT}/`);
});
