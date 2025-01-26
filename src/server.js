require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const logger = require('./config/logger');
const connectDB = require('./config/database');
const setupWebSockets = require('./config/websocket');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const tradingRoutes = require('./routes/tradingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect to MongoDB
connectDB();

// Setup WebSockets
setupWebSockets(io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Market Learning API',
      version: '1.0.0',
      description: 'API documentation for Stock Market Learning platform'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`
      }
    ]
  },
  apis: ['./src/routes/*.js']
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  httpServer.close(() => process.exit(1));
});

module.exports = app; // For testing purposes
