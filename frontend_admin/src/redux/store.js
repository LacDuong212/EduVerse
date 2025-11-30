import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import adminReducer from './adminSlice';


// combine all reducers
const rootReducer = combineReducers({
  admin: adminReducer
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['admin']
};

// create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// create persistor
export const persistor = persistStore(store);
