import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/wishlist`;

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`, { withCredentials: true });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ userId, course }, { rejectWithValue }) => {
    try {
      const courseIdToSend = course._id;

      const response = await axios.post(
        `${API_URL}/add`, 
        {
          userId,
          courseId: courseIdToSend
        },
        { withCredentials: true } 
      );

      const newItem = response.data.data;

      return {
        ...newItem,
        courseId: newItem.courseId._id ? newItem.courseId : course
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async ({ userId, courseId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/remove`, {
        data: { userId, courseId },
        withCredentials: true 
      });

      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "succeeded";
      })

      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.status = "succeeded";
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => item.courseId._id !== action.payload
        );
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;