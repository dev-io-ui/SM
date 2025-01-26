const WebSocket = require('ws');
const logger = require('../config/logger');
const { EventEmitter } = require('events');

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.connections = new Map();
    this.subscriptions = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
  }

  connect(symbol, userId) {
    const wsUrl = `${process.env.STOCK_WS_URL}/${symbol}?token=${process.env.STOCK_API_KEY}`;
    
    if (!this.connections.has(symbol)) {
      const ws = new WebSocket(wsUrl);
      
      ws.on('open', () => {
        logger.info(`WebSocket connection established for ${symbol}`);
        this.reconnectAttempts.set(symbol, 0);
        this.emit('connected', { symbol });
      });

      ws.on('message', (data) => {
        try {
          const parsedData = JSON.parse(data);
          this.emit('price_update', {
            symbol,
            price: parsedData.price,
            change: parsedData.change,
            volume: parsedData.volume,
            timestamp: parsedData.timestamp
          });
        } catch (error) {
          logger.error(`Error parsing WebSocket message for ${symbol}:`, error);
        }
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for ${symbol}:`, error);
        this.emit('error', { symbol, error });
      });

      ws.on('close', () => {
        logger.info(`WebSocket connection closed for ${symbol}`);
        this.handleReconnect(symbol);
      });

      this.connections.set(symbol, ws);
    }

    // Track subscriptions per user
    if (!this.subscriptions.has(userId)) {
      this.subscriptions.set(userId, new Set());
    }
    this.subscriptions.get(userId).add(symbol);
  }

  disconnect(symbol, userId) {
    if (this.subscriptions.has(userId)) {
      this.subscriptions.get(userId).delete(symbol);
      
      // Check if no more users are subscribed to this symbol
      let hasOtherSubscribers = false;
      for (const [uid, symbols] of this.subscriptions.entries()) {
        if (uid !== userId && symbols.has(symbol)) {
          hasOtherSubscribers = true;
          break;
        }
      }

      if (!hasOtherSubscribers) {
        const ws = this.connections.get(symbol);
        if (ws) {
          ws.close();
          this.connections.delete(symbol);
          this.reconnectAttempts.delete(symbol);
        }
      }
    }
  }

  async handleReconnect(symbol) {
    const attempts = this.reconnectAttempts.get(symbol) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(symbol, attempts + 1);
      
      const backoffTime = Math.min(1000 * Math.pow(2, attempts), 30000);
      
      logger.info(`Attempting to reconnect to ${symbol} in ${backoffTime}ms (attempt ${attempts + 1}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.connections.has(symbol)) {
          this.connections.delete(symbol);
          this.connect(symbol);
        }
      }, backoffTime);
    } else {
      logger.error(`Max reconnection attempts reached for ${symbol}`);
      this.emit('max_reconnect_attempts', { symbol });
    }
  }

  disconnectAll(userId) {
    if (this.subscriptions.has(userId)) {
      const symbols = this.subscriptions.get(userId);
      for (const symbol of symbols) {
        this.disconnect(symbol, userId);
      }
      this.subscriptions.delete(userId);
    }
  }

  getActiveSubscriptions(userId) {
    return Array.from(this.subscriptions.get(userId) || []);
  }
}

module.exports = new WebSocketService();
