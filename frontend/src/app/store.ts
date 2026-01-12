import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';

// Configure Redux store with RTK Query
export const store = configureStore({
  reducer: {
    // Add the RTK Query API reducer
    [api.reducerPath]: api.reducer,
  },
  // Add RTK Query middleware for caching, invalidation, polling, etc.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

// Infer the RootState and AppDispatch types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
