import { setCredentials, setLoading, clearCredentials } from '@/store/authSlice';
import authApi from '../api/auth.api';

/**
 * Auth service bridges the API layer with Redux dispatch.
 * All side effects (token storage, state updates) live here.
 */
const authService = {
  /**
   * Calls signup API and populates Redux auth state.
   */
  signup: async (dispatch, formData) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.signup(formData);
      const { user, accessToken } = response.data.data;
      dispatch(setCredentials({ user, accessToken }));
      return { success: true, user };
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  },

  /**
   * Calls login API and populates Redux auth state.
   */
  login: async (dispatch, formData) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.login(formData);
      const { user, accessToken } = response.data.data;
      dispatch(setCredentials({ user, accessToken }));
      return { success: true, user };
    } catch (error) {
      dispatch(setLoading(false));
      throw error;
    }
  },

  /**
   * Fetches the current user and restores session.
   * Called on app mount to re-hydrate auth state if token exists in localStorage.
   */
  initAuth: async (dispatch, getState) => {
    const token = getState().auth.accessToken;
    
    // If no token exists, just clear loading state
    if (!token) {
      dispatch(setLoading(false));
      return null;
    }

    dispatch(setLoading(true));
    try {
      const response = await authApi.getMe();
      const { user } = response.data.data;
      // Update auth state with user data (token already in Redux from localStorage)
      dispatch(setCredentials({ user, accessToken: token }));
      return user;
    } catch (error) {
      // Token is invalid or expired, clear credentials
      dispatch(clearCredentials());
      return null;
    }
  },

  /**
   * Clears Redux auth state (token is in-memory; clearing state is sufficient).
   */
  logout: (dispatch) => {
    dispatch(clearCredentials());
  },
};

export default authService;
