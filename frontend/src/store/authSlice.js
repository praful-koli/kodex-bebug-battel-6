import { createSlice } from '@reduxjs/toolkit';

// Load token from localStorage on initialization
const loadTokenFromStorage = () => {
  try {
    const token = localStorage.getItem('accessToken');
    return token || null;
  } catch {
    return null;
  }
};

const initialState = {
  user: null,
  accessToken: loadTokenFromStorage(),
  isAuthenticated: false,
  loading: true, // Start with loading true to check for existing session
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading(state, action) {
      state.loading = action.payload;
    },

    setCredentials(state, action) {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      
      // Persist token to localStorage
      try {
        localStorage.setItem('accessToken', accessToken);
      } catch (error) {
        console.error('Failed to save token to localStorage:', error);
      }
    },

    clearCredentials(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Remove token from localStorage
      try {
        localStorage.removeItem('accessToken');
      } catch (error) {
        console.error('Failed to remove token from localStorage:', error);
      }
    },

    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setLoading, setCredentials, clearCredentials, updateUser } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
