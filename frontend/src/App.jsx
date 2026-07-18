import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { useDispatch } from 'react-redux';
import router from '@/routes';
import authService from '@/features/auth/services/auth.service';
import { store } from '@/store';

/**
 * Root application component.
 * Initializes auth state on mount, then renders the router.
 */
const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize auth state from localStorage token
    authService.initAuth(dispatch, store.getState);
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;
