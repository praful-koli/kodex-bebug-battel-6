import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/store';

import SocketProvider from './SocketProvider';

/**
 * Wraps the entire app with Redux Provider, SocketProvider, and Sonner Toaster.
 * Router is handled separately in main.jsx via RouterProvider.
 */
const AppProviders = ({ children }) => {
  return (
    <Provider store={store}>
      <SocketProvider>
        {children}
      </SocketProvider>
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        toastOptions={{
          style: {
            background: '#ffffff',
            border: '1px solid #e5e0db',
            color: '#1a1816',
            borderRadius: '0.5rem',
          },
          className: 'toast-custom',
        }}
      />
    </Provider>
  );
};

export default AppProviders;
 