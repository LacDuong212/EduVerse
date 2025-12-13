import authReducer from './authSlice';
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
  courses: coursesReducer,
  cart: cartReducer,
  wishlist: wishlistReducer
});

// choose what to persist
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [],  // add reducer names you want to persist here
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
