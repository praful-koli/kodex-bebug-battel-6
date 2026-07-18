import { createContext, useContext, useEffect, useState } from 'react';
import ConnectionManager from '@/features/game/services/ConnectionManager';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribe = ConnectionManager.onStatusChange((status) => {
      setConnectionStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ connectionStatus, connectionManager: ConnectionManager }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useConnection must be used within a SocketProvider');
  }
  return context.connectionStatus;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.connectionManager;
};

export default SocketProvider;
