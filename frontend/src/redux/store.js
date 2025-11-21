import authReducer from './authSlice';
import adminReducer from './adminSlice';
import coursesReducer from './coursesSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";      // defaults to localStorage for web
import { configureStore } from '@reduxjs/toolkit';

// combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  courses: coursesReducer,
  cart: cartReducer,
  wishlist: wishlistReducer
});

// choose what to persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only persist auth
};

// create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // suppress persist warnings
    }),
});

// create persistor
export const persistor = persistStore(store);
