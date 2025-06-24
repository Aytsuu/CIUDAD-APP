export type Notification = {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // Add other notification fields as needed
};

export type WebSocketStatus = "connecting" | "connected" | "disconnected" | "error";

class WebSocketService {
  status<T>(status: any): [any, any] {
      throw new Error('Method not implemented.');
  }
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3 seconds
  private callbacks = {
    notification: new Set<(notification: Notification) => void>(),
    connectionStatus: new Set<(status: WebSocketStatus) => void>(),
  };

  constructor() {
    this.connect = this.connect.bind(this);
    this._handleConnectionClose = this._handleConnectionClose.bind(this);
  }

  connect(token: string): void {
    // Close any existing connection
    this.disconnect();
    this.token = token;

    // Notify about connection attempt
    this._notifyStatusListeners("connecting");

    // Create new WebSocket connection with auth token
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/notification/?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    // Set up event handlers
    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this._notifyStatusListeners("connected");
    };

    this.socket.onclose = this._handleConnectionClose;

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this._notifyStatusListeners("error");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "notification") {
          this._notifyNotificationListeners(data.notification);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
  }

  private _handleConnectionClose(): void {
    this._notifyStatusListeners("disconnected");

    // Try to reconnect if we have a token
    if (this.token && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnection attempt ${this.reconnectAttempts}`);
        this.connect(this.token!);
      }, this.reconnectInterval);
    }
  }

  markNotificationAsRead(notificationId: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: "read_notification",
          notification_id: notificationId,
        })
      );
    } else {
      console.warn(
        "Cannot mark notification as read - WebSocket not connected"
      );
    }
  }

  onNotification(callback: (notification: Notification) => void): () => void {
    this.callbacks.notification.add(callback);
    return () => this.callbacks.notification.delete(callback);
  }

  onConnectionStatusChange(
    callback: (status: WebSocketStatus) => void
  ): () => void {
    this.callbacks.connectionStatus.add(callback);
    return () => this.callbacks.connectionStatus.delete(callback);
  }

  private _notifyNotificationListeners(notification: Notification): void {
    this.callbacks.notification.forEach((callback) => callback(notification));
  }

  private _notifyStatusListeners(status: WebSocketStatus): void {
    this.callbacks.connectionStatus.forEach((callback) => callback(status));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.onclose = null; // Prevent reconnect attempt
      this.socket.close();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
