import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface Achievement {
  points: number;
  level: number;
  badges: Array<{
    name: string;
    earnedAt: Date;
  }>;
  dailyStreak: {
    count: number;
    lastLoginDate: Date;
  };
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
}

interface LeaderboardEntry {
  _id: string;
  name: string;
  points: number;
  level: number;
  badges: string[];
}

interface GamificationState {
  achievements: Achievement | null;
  leaderboard: LeaderboardEntry[];
  dailyChallenges: Challenge[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  achievements: null,
  leaderboard: [],
  dailyChallenges: [],
  isLoading: false,
  error: null,
};

export const getAchievements = createAsyncThunk(
  'gamification/getAchievements',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.get('/api/gamification/achievements', config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch achievements');
    }
  }
);

export const getLeaderboard = createAsyncThunk(
  'gamification/getLeaderboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/gamification/leaderboard');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
    }
  }
);

export const getDailyChallenges = createAsyncThunk(
  'gamification/getDailyChallenges',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.get('/api/gamification/daily-challenges', config);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily challenges');
    }
  }
);

export const awardPoints = createAsyncThunk(
  'gamification/awardPoints',
  async (
    { action, context }: { action: string; context?: any },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: any = getState();
      const config = {
        headers: {
          Authorization: `Bearer ${state.auth.user.token}`,
        },
      };
      const response = await axios.post(
        '/api/gamification/award-points',
        { action, context },
        config
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to award points');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    resetGamificationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.achievements = action.payload;
      })
      .addCase(getAchievements.rejected, (state, action) => {
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
      })
      .addCase(getDailyChallenges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDailyChallenges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyChallenges = action.payload;
      })
      .addCase(getDailyChallenges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(awardPoints.fulfilled, (state, action) => {
        if (state.achievements) {
          state.achievements.points = action.payload.totalPoints;
          state.achievements.level = action.payload.level;
        }
      });
  },
});

export const { resetGamificationError } = gamificationSlice.actions;
export default gamificationSlice.reducer;
