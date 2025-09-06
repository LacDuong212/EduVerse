import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import coursesReducer from './coursesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: coursesReducer,
  },
});