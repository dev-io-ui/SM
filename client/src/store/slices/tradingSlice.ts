import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Portfolio {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  lastUpdated: Date;
}

interface Trade {
  _id: string;
  type: 'buy' | 'sell';
  symbol: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
}

interface TradingState {
  portfolio: Portfolio[];
  trades: Trade[];
  balance: number;
  leaderboard: any[];
  isLoading: boolean;
  error: string | null;
  realTimeData: {
    [key: string]: {
      price: number;
      change: number;
      volume: number;
    };
  };
}

const initialState: TradingState = {
  portfolio: [],
  trades: [],
  balance: 0,
  leaderboard: [],
  isLoading: false,
  error: null,
  realTimeData: {},
};

export const executeTrade = createAsyncThunk(
  'trading/executeTrade',
  async (tradeData: {
    type: 'buy' | 'sell';
    symbol: string;
    quantity: number;
    price: number;
    orderType?: 'market' | 'limit';
    limitPrice?: number;
    stopLoss?: number;
    takeProfit?: number;
  }, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.post('/api/trading/execute', tradeData, config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Trade execution failed');
    }
  }
);

export const getPortfolio = createAsyncThunk(
  'trading/getPortfolio',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.get('/api/trading/portfolio', config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio');
    }
  }
);

export const getTradingHistory = createAsyncThunk(
  'trading/getTradingHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.get('/api/trading/history', config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trading history');
    }
  }
);

export const getLeaderboard = createAsyncThunk('trading/getLeaderboard', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/trading/leaderboard');
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
  }
});

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    updateRealTimeData: (state, action) => {
      state.realTimeData[action.payload.symbol] = {
        price: action.payload.price,
        change: action.payload.change,
        volume: action.payload.volume,
      };
    },
    resetTradingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(executeTrade.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executeTrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload.portfolio;
        state.balance = action.payload.balance;
        state.trades = [action.payload.trade, ...state.trades];
      })
      .addCase(executeTrade.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload.portfolio;
        state.balance = action.payload.balance;
      })
      .addCase(getPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getTradingHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTradingHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trades = action.payload;
      })
      .addCase(getTradingHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload;
      })
      .addCase(getLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateRealTimeData, resetTradingError } = tradingSlice.actions;
export default tradingSlice.reducer;
