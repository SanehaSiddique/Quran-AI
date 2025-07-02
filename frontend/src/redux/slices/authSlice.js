import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  chatSessions: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      const { email } = action.payload;
      state.isAuthenticated = true;
      state.user = {
        id: '1',
        name: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
      };
      state.chatSessions = [
        {
          id: '1',
          title: 'Patience in Difficult Times',
          timestamp: new Date().toISOString(),
          messageCount: 8
        },
        {
          id: '2',
          title: 'Understanding Gratitude',
          timestamp: new Date().toISOString(),
          messageCount: 12
        }
      ];
      
      // Save to localStorage
      localStorage.setItem('quran_auth', 'true');
      localStorage.setItem('quran_user', JSON.stringify(state.user));
      localStorage.setItem('quran_chat_sessions', JSON.stringify(state.chatSessions));
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.chatSessions = [];
      
      // Clear localStorage
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
  }
});

export const { login, logout, loadFromStorage, migrateTempData } = authSlice.actions;
export default authSlice.reducer;