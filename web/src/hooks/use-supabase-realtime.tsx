// import { useEffect, useState } from 'react';
// import { RealtimeChannel } from '@supabase/supabase-js';
// import supabase from '@/supabase/supabase';
// import { api } from '@/api/api';

// export const useNotifications = (userId: string | undefined) => {
//   const [notifications, setNotifications] = useState<any[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // Fetch initial notifications
//   const fetchNotifications = async () => {
//     if (!userId) return;
//     const { data } = await api.get('/notification/list/');
//     setNotifications(data);
//     setUnreadCount(data.filter((n: any) => !n.is_read).length);
//   };

//   // Realtime listener for new notifications
//   useEffect(() => {
//     if (!userId) return;

//     let channel: RealtimeChannel;

//     const setupRealtime = () => {
//       channel = supabase
//         .channel(`notifications_${userId}`)
//         .on(
//           'postgres_changes',
//           {
//             event: 'INSERT',
//             schema: 'public',
//             table: 'notification',
//             filter: `recipient_id=eq.${userId}`,
//           },
//           (payload) => {
//             const newNotification = payload.new;
//             setNotifications((prev) => [newNotification, ...prev]);
//             setUnreadCount((prev) => prev + 1);
            
//             // Browser notification (optional)
//             if (Notification.permission === 'granted') {
//               new Notification(newNotification.title, {
//                 body: newNotification.message,
//               });
//             }
//           }
//         )
//         .subscribe();

//       return () => {
//         if (channel) supabase.removeChannel(channel);
//       };
//     };

//     fetchNotifications();
//     setupRealtime();

//     return () => {
//       if (channel) supabase.removeChannel(channel);
//     };
//   }, [userId]);

//   // Mark as read
//   const markAsRead = async (id: string) => {
//     await api.patch(`/notification/${id}/mark_as_read/`);
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );
//     setUnreadCount((prev) => prev - 1);
//   };

//   return { notifications, unreadCount, markAsRead, fetchNotifications };
// };
import { useEffect, useState } from 'react';
import supabase from '@/supabase/supabase';

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

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUnreadCount = (filter: NotificationType) => {
    return notifications.filter(n => 
      !n.is_read && (filter === 'all' || n.notification_type === filter)
    ).length;
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('id', id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? {...n, is_read: true} : n)
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notification')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      setNotifications(prev => 
        prev.map(n => ({...n, is_read: true}))
      );
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notification')
          .select('*')
          .eq('recipient_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    const channel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload: any) => {
          // Handle realtime updates
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          }
          if (payload.eventType === 'UPDATE') {
            setNotifications(prev =>
              prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { 
    notifications, 
    getUnreadCount, 
    markAsRead,
    markAllAsRead,
    isLoading,
    error
  };
};