import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// API login
export const loginAdmin = createAsyncThunk(
  'admin/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${backendUrl}/api/admin/login`, { email, password });
      if (!res.data.success) return rejectWithValue(res.data.message);

      localStorage.setItem('adminToken', res.data.token);

      return res.data.admin; // { id, name, email }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// API lấy profile (tự động khi reload)
export const fetchAdminProfile = createAsyncThunk(
  'admin/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return rejectWithValue('No token found');

      const res = await axios.get(`${backendUrl}/api/admin/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.admin;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// API logout
export const logoutAdmin = createAsyncThunk('admin/logout', async () => {
  const token = localStorage.getItem('adminToken');
  await axios.post(`${backendUrl}/api/admin/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  localStorage.removeItem('adminToken');
  return null;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    admin: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH PROFILE
      .addCase(fetchAdminProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(fetchAdminProfile.rejected, (state) => {
        state.loading = false;
      })

      // LOGOUT
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
      });
  },
});

export default adminSlice.reducer;
