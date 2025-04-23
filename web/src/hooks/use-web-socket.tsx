import { useEffect } from 'react';
import { webSocketService, WebSocketStatus, Notification as WebSocketNotification } from '@/services/web-socket-service';

export const useWebSocket = (
  token: string,
  options?: {
    onNotification?: (notification: WebSocketNotification) => void;
    onConnectionStatus?: (status: WebSocketStatus) => void;
  }
) => {
  useEffect(() => {
    if (!token) return;

    webSocketService.connect(token);

    const cleanupFns: (() => void)[] = [];

    if (options?.onNotification) {
      const unsubscribe = webSocketService.onNotification(options.onNotification);
      cleanupFns.push(unsubscribe);
    }

    if (options?.onConnectionStatus) {
      const unsubscribe = webSocketService.onConnectionStatusChange(options.onConnectionStatus);
      cleanupFns.push(unsubscribe);
    }

    return () => {
      cleanupFns.forEach(fn => fn());
      webSocketService.disconnect();
    };
  }, [token, options?.onNotification, options?.onConnectionStatus]);
};