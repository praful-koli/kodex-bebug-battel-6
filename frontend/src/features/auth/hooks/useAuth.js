import { useSelector } from 'react-redux';
import {
  selectUser,
  selectAccessToken,
  selectIsAuthenticated,
  selectAuthLoading,
} from '@/store/authSlice';

/**
 * Convenience hook to access all auth state from any component.
 */
const useAuth = () => {
  const user = useSelector(selectUser);
  const accessToken = useSelector(selectAccessToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);

  return { user, accessToken, isAuthenticated, loading };
};

export default useAuth;
