import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import coursesReducer from "./coursesSlice";
import wishlistReducer from "./wishlistSlice";

// combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  courses: coursesReducer,
  cart: cartReducer,
  wishlist: wishlistReducer
});

// configure store
export const store = configureStore({
  reducer: rootReducer,
});