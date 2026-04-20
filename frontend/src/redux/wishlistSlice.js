import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}`,
        { withCredentials: true }
      );

      const { success, result, message } = response.data;

      if (!success) {
        return rejectWithValue(message || "Failed to fetch wishlist");
      }

      return result || [];

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/`,
        { courseId },
        { withCredentials: true }
      );

      const { success, result, message } = response.data;

      if (!success) {
        return rejectWithValue(message || "Failed to add to wishlist");
      }

      return result;

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ courseId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/`, {
        data: { courseId },
        withCredentials: true
      });

      const { success, result, message } = response.data;

      if (!success) {
        return rejectWithValue(message || "Failed to remove item");
      }

      return result;

    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue(errorMessage);
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.courseId !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;