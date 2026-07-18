import { toast } from 'sonner';

export const registerNotificationEvents = (connectionManager, { onError }) => {
  const unsubError = connectionManager.subscribe('error', (err) => {
    toast.error(err.message || 'Game socket error occurred');
    onError?.(err);
  });

  return () => {
    unsubError();
  };
};
