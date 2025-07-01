import { NotificationBell } from './notification-bell';
import { useNotifications } from '@/hooks/use-supabase-realtime';
import { useSession } from '@supabase/auth-helpers-react';
import { useState } from 'react';

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

export const NotificationDropdown = () => {
  const session = useSession();
  const userId = session?.user?.id;
  const { 
    notifications, 
    getUnreadCount, 
    markAsRead,
    markAllAsRead,
    isLoading,
    error
  } = useNotifications(userId || '');
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType>('all');

  const unreadCount = getUnreadCount(filter);
  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || notification.notification_type === filter
  );

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    // Add additional click handling here if needed
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="p-1 rounded-full hover:bg-gray-100 transition-colors relative"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <NotificationBell count={unreadCount} />
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200"
          role="menu"
        >
          <div className="p-3 border-b flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <select 
              className="text-xs border rounded px-2 py-1"
              value={filter}
              onChange={(e) => setFilter(e.target.value as NotificationType)}
              aria-label="Filter notifications"
            >
              <option value="all">All</option>
              <option value="report">Reports</option>
              <option value="alert">Alerts</option>
              <option value="announcement">Announcements</option>
              <option value="success">Success</option>
            </select>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : error ? (
              <p className="p-4 text-red-500 text-center">Error loading notifications</p>
            ) : filteredNotifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications</p>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  role="menuitem"
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {new Date(notification.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {notification.related_object_type && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                      {notification.related_object_type}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};