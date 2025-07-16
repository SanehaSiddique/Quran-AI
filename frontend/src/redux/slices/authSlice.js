import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../axiosInstance';

const initialState = {
  isAuthenticated: false,
  user: null,
  chatSessions: [],
  loading: false,
  error: null,
  resetEmail: null, // Track email for password reset flow
  resetStep: null // 'request', 'verify', 'reset' for tracking reset progress
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/signup', { name, email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/forgot-password', { email });
      return { email, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid OTP');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, newPassword, resetToken }, { rejectWithValue }) => { // Added resetToken
    try {
      const response = await API.post('/auth/reset-password', { 
        email, 
        newPassword,
        resetToken // Include the token from verifyOTP step
      });
      return response.data;
    } catch (error) {
      console.error('Reset Password Error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null; 
      state.chatSessions = [];
      state.error = null;
      state.resetEmail = null;
      state.resetStep = null;

      localStorage.removeItem('quran_auth');
      localStorage.removeItem('quran_user');
      localStorage.removeItem('quran_chat_sessions');
      localStorage.removeItem('quran_token');
    },
    loadFromStorage(state) {
      const savedAuth = localStorage.getItem('quran_auth');
      const savedUser = localStorage.getItem('quran_user');
      const savedSessions = localStorage.getItem('quran_chat_sessions');

      if (savedAuth === 'true' && savedUser) {
        state.isAuthenticated = true;
        state.user = JSON.parse(savedUser);
        if (savedSessions) {
          state.chatSessions = JSON.parse(savedSessions);
        }
      }
    },
    migrateTempData(state, action) {
      const tempChatHistory = action.payload;
      if (tempChatHistory.length > 0) {
        const newSession = {
          id: Date.now().toString(),
          title: 'Guest Session',
          timestamp: new Date().toISOString(),
          messageCount: tempChatHistory.length
        };
        state.chatSessions = [newSession, ...state.chatSessions];
        localStorage.setItem('quran_chat_sessions', JSON.stringify(state.chatSessions));
      }
    },
    // Reset password flow management
    setResetStep(state, action) {
      state.resetStep = action.payload;
    },
    clearResetState(state) {
      state.resetEmail = null;
      state.resetStep = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = {
        ...user,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
      };
      state.chatSessions = [];
      state.loading = false;
      state.resetEmail = null;
      state.resetStep = null;

      localStorage.setItem('quran_auth', 'true');
      localStorage.setItem('quran_user', JSON.stringify(state.user));
      localStorage.setItem('quran_chat_sessions', JSON.stringify(state.chatSessions));
      localStorage.setItem('quran_token', token);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      const { user, token } = action.payload;
      state.isAuthenticated = true;
      state.user = {
        ...user,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`
      };
      state.chatSessions = [];
      state.loading = false;

      localStorage.setItem('quran_auth', 'true');
      localStorage.setItem('quran_user', JSON.stringify(state.user));
      localStorage.setItem('quran_chat_sessions', JSON.stringify(state.chatSessions));
      localStorage.setItem('quran_token', token);
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Forgot Password - Request OTP
    builder.addCase(forgotPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.loading = false;
      state.resetEmail = action.payload.email;
      state.resetStep = 'verify';
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOTP.fulfilled, (state) => {
      state.loading = false;
      state.resetStep = 'reset';
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.loading = false;
      state.resetEmail = null;
      state.resetStep = null;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { 
  logout, 
  loadFromStorage, 
  migrateTempData,
  setResetStep,
  clearResetState
} = authSlice.actions;

export default authSlice.reducer;