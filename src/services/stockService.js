const axios = require('axios');
const WebSocket = require('ws');
const logger = require('../config/logger');

class StockService {
  constructor() {
    this.apiKey = process.env.STOCK_API_KEY;
    this.baseUrl = process.env.STOCK_API_BASE_URL;
    this.wsClients = new Set();
    this.stockData = new Map();
  }

  async getStockPrice(symbol) {
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol,
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching stock price for ${symbol}:`, error);
      throw new Error('Failed to fetch stock price');
    }
  }

  async getHistoricalData(symbol, interval = '1d', limit = 30) {
    try {
      const response = await axios.get(`${this.baseUrl}/historical`, {
        params: {
          symbol,
          interval,
          limit,
          apikey: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}:`, error);
      throw new Error('Failed to fetch historical data');
    }
  }

  initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
      this.wsClients.add(ws);
      logger.info('New WebSocket client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          if (data.type === 'subscribe' && data.symbols) {
            this.subscribeToStocks(data.symbols);
          }
        } catch (error) {
          logger.error('Error processing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.wsClients.delete(ws);
        logger.info('WebSocket client disconnected');
      });
    });

    // Start sending real-time updates
    this.startRealTimeUpdates();
  }

  async subscribeToStocks(symbols) {
    for (const symbol of symbols) {
      try {
        const data = await this.getStockPrice(symbol);
        this.stockData.set(symbol, data);
      } catch (error) {
        logger.error(`Error subscribing to ${symbol}:`, error);
      }
    }
  }

  startRealTimeUpdates() {
    setInterval(async () => {
      for (const [symbol, data] of this.stockData) {
        try {
          const newData = await this.getStockPrice(symbol);
          this.stockData.set(symbol, newData);
          this.broadcastUpdate(symbol, newData);
        } catch (error) {
          logger.error(`Error updating ${symbol}:`, error);
        }
      }
    }, 5000); // Update every 5 seconds
  }

  broadcastUpdate(symbol, data) {
    const update = JSON.stringify({
      type: 'stockUpdate',
      symbol,
      data,
    });

    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(update);
      }
    });
  }
}

module.exports = new StockService();
