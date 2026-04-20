import axios from "axios";
import { createSlice, createAsyncThunk, isAnyOf } from "@reduxjs/toolkit";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/cart`;

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchCartCount = createAsyncThunk(
  "cart/fetchCartCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/items`, { withCredentials: true });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/items`, { courseId }, { withCredentials: true });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ courseIds }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/items`, {
        data: { courseIds },
        withCredentials: true
      });
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/`, { withCredentials: true });
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        isAnyOf(fetchCart.pending, fetchCartCount.pending, addToCart.pending, removeFromCart.pending),
        (state) => {
          state.status = "loading";
        }
      )
      .addMatcher(
        isAnyOf(fetchCart.fulfilled, addToCart.fulfilled, removeFromCart.fulfilled, clearCart.fulfilled),
        (state, action) => {
          state.status = "succeeded";
          state.items = action.payload || [];
        }
      )
      .addMatcher(
        isAnyOf(fetchCart.rejected, addToCart.rejected, removeFromCart.rejected, clearCart.rejected),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        }
      );
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;