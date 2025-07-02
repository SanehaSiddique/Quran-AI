import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../../axiosInstance';

const initialState = {
  isAuthenticated: false,
  user: null,
  chatSessions: [],
  loading: false,
  error: null
};

// Login Thunk
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post('/login', { email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

// Signup Thunk
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await API.post('/signup', { name, email, password });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Signup failed');
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
      state.chatSessions = [];
      state.error = null;

      localStorage.removeItem('quran_auth');
      localStorage.removeItem('quran_user');
      localStorage.removeItem('quran_chat_sessions');
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
      state.chatSessions = []; // Can preload later from backend if needed
      state.loading = false;

      localStorage.setItem('quran_auth', 'true');
      localStorage.setItem('quran_user', JSON.stringify(state.user));
      localStorage.setItem('quran_chat_sessions', JSON.stringify(state.chatSessions));
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
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { logout, loadFromStorage, migrateTempData } = authSlice.actions;
export default authSlice.reducer;
