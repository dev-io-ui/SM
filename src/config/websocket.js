const logger = require('./logger');

const setupWebSockets = (io) => {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join virtual trading room
    socket.on('join_trading_room', (userId) => {
      socket.join(`trading_${userId}`);
      logger.info(`User ${userId} joined trading room`);
    });

    // Handle real-time stock price updates
    socket.on('subscribe_stock', (symbol) => {
      socket.join(`stock_${symbol}`);
      logger.info(`Client ${socket.id} subscribed to ${symbol}`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  // Setup interval for simulated stock price updates
  setInterval(() => {
    // Simulate stock price changes
    const mockStockUpdate = {
      symbol: 'AAPL',
      price: Math.random() * 1000,
      timestamp: new Date()
    };
    io.to(`stock_${mockStockUpdate.symbol}`).emit('stock_update', mockStockUpdate);
  }, 5000);
};

module.exports = setupWebSockets;
