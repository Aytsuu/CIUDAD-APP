export type UserPosition =
  | "health_staff"
  | "medical_officer"
  | "treasurer"
  | "clerk"
  | "Admin"
  | "supervisor"
  | "tanod"
  | "Emergency Response Head"
  | "Barangay Captain";

export interface User {
  acc_id?: string;
  username: string;
  email: string;
  profile_image?: string | null;
  resident?: Record<string, any>;
  staff?: Record<string, any>;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    username?: string
  ) => Promise<{ requiresConfirmation?: boolean }>;
  refreshSession: () => Promise<void>;

  sendEmailOTP: (email: string) => Promise<any>;
  verifyEmailOTPAndLogin: (otp: string, email: string) => Promise<User>;
  otpSent: boolean;
  email: string | null;
}

// Notification types

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
  // sender_id?: Record<string, any>;
  is_read?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  recipient_ids: string[];
  metadata?: Record<string, any>;
}

export interface NotficationFormat {
  title: string;
  message: string;
  recipient_ids: (string | number)[];
  metadata: {
    action_url: string;
    sender_name: string;
    sender_avatar: string;
  };
}
