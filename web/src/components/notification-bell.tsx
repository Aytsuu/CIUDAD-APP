import { BellIcon } from 'lucide-react';

// Types
type NotificationType = 'success' | 'report' | 'alert' | 'announcement' | 'all';

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  is_read: boolean;
  created_at: string;
  related_object_type?: string;
}

// Notification Bell Component
export const NotificationBell = ({ count = 0 }: { count?: number }) => {
  return (
    <div className="relative">
      <BellIcon className="w-6 h-6 text-gray-700" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
          {Math.min(count, 99)}
        </span>
      )}
    </div>
  );
};