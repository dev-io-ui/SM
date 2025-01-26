import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import tradingReducer from './slices/tradingSlice';
import gamificationReducer from './slices/gamificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    trading: tradingReducer,
    gamification: gamificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
