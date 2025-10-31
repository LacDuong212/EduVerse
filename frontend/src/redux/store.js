import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import adminReducer from './adminSlice';
import coursesReducer from './coursesSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    courses: coursesReducer,
    cart: cartReducer,
  },
});