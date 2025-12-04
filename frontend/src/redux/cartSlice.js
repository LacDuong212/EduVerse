import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/cart`;

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/`, { withCredentials: true });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCartCount = createAsyncThunk(
  "cart/fetchCartCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/count`, { withCredentials: true });
      return response.data.count;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/add`, 
        { courseId }, 
        { withCredentials: true }
      );
      return response.data.cart; 
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/remove`, {
        data: { courseId },
        withCredentials: true 
      });
      return response.data.cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCartApi",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/clear`, { withCredentials: true });
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  totalItem: 0,
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItem = 0;
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Cart ---
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.totalItem = action.payload.length; 
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- Fetch Cart Count ---
      .addCase(fetchCartCount.fulfilled, (state, action) => {
        state.totalItem = action.payload;
      })

      // --- Add to Cart ---
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.totalItem = action.payload.length;
        state.status = "succeeded";
      })

      // --- Remove from Cart ---
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.totalItem = action.payload.length;
        state.status = "succeeded";
      })

      // --- Clear Cart ---
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
        state.totalItem = 0;
        state.status = "succeeded";
      });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;