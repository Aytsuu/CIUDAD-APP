export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  send: (payload: CreateNotificationPayload) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  sender_id?: Record<string, any>;
  is_read?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateNotificationPayload{
  title: string;
  message: string;
  recipient_ids: string[];
  metadata?: Record<string, any>;
}

export type NotificationType =
  | "REPORT_FILED"
  | "PAYMENT_SUCCESS"
  | "NEW_MESSAGE"
  | "SYSTEM_ALERT";