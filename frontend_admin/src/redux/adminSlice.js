import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.withCredentials = true;

export const loginAdmin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

      if (!res.data.success) return rejectWithValue(res.data.message);

      return res.data.admin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'admin/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${backendUrl}/api/auth/is-auth`);

      if (!res.data.success) {
        return rejectWithValue(res.data.message);
      }

      return res.data.admin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Unauthorized");
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'admin/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${backendUrl}/api/auth/logout`);

      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  });

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // CHECK AUTH
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.admin = action.payload;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.admin = null;
      })

      // LOGOUT
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
