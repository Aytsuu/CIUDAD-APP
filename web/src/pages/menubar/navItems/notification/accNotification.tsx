import { useState, useEffect } from 'react';
import { useRealtimeSubscription } from '@/hooks/use-supabase-realtime';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import supabase from '@/supabase/supabase';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
}

export default function AccNotification({ user_id }: { user_id: string }): JSX.Element{
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load initial notifications
  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('notification')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });
      if (data) setNotifications(data);
    };
    fetchInitial();
  }, [user_id]);

  // Realtime updates
  useRealtimeSubscription(
    `notifications-${user_id}`,
    (payload: { event: string; new: Notification; old: Notification }) => {
      if (payload.event === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev]);
        new Audio('/sounds/notification.mp3').play();
      }
      if (payload.event === 'UPDATE') {
        setNotifications(prev =>
          prev.map(n => (n.id === payload.new.id ? payload.new : n))
        );
      }
      if (payload.event === 'DELETE') {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
      }
    },
    'notification',
    `user_id=eq.${user_id}`
  );

  const markAsRead = async (id: string) => {
    await supabase
      .from('notification')
      .update({ is_read: true })
      .eq('id', id);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Icon mapping
  const typeIcons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    info: <Info className="h-4 w-4 text-blue-500" />
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full relative hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                aria-label="Close notifications"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                <ul>
                  <AnimatePresence>
                    {notifications.map(notification => (
                      <motion.li
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-b border-gray-100 dark:border-gray-700 ${!notification.is_read ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
                      >
                        <div
                          onClick={() => markAsRead(notification.id)}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {typeIcons[notification.type]}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <time className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-center">
                <button
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.is_read) markAsRead(n.id);
                    });
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


// dayjs.extend(relativeTime);

// export default function AccNotification(): JSX.Element {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth(); // Get just the user object
  
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         if (!user?.id || !user?.token) return;
        
//         const response = await axios.get(
//           "http://127.0.0.1:8000/notification/lists/",
//           {
//             headers: {
//               Authorization: `Token ${user.token}`,
//             },
//           }
//         );
//         console.log("API Response:", response.data);
//         setNotifications(response.data);
//       } catch (error) {
//         console.error("Error fetching notifications:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, [user?.id, user?.token]); // Depend on both user ID and token

//   const handleNotificationClick = async (notificationId: number) => {
//     try {
//       if (!user?.token) return;
      
//       await axios.patch(
//         `http://127.0.0.1:8000/notification/mark-read/${notificationId}/`,
//         {},
//         {
//           headers: {
//             Authorization: `Token ${user.token}`,
//           },
//         }
//       );

//       // Update local state
//       setNotifications((prev) =>
//         prev.map((n) =>
//           Number(n.id) === notificationId ? { ...n, is_read: true } : n
//         )
//       );
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       if (!user?.token) return;
      
//       await axios.patch(
//         "http://127.0.0.1:8000/notification/mark-read/",
//         {},
//         {
//           headers: {
//             Authorization: `Token ${user.token}`,
//           },
//         }
//       );

//       // Update all notifications to read
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//     } catch (error) {
//       console.error("Error marking all as read:", error);
//     }
//   };
  
//   const notificationPopover = (
//     <div className="max-h-96 overflow-y-auto">
//       <hr className="mb-2" />
//       {loading ? (
//         <div className="p-4 text-center">Loading notifications...</div>
//       ) : notifications.length > 0 ? (
//         notifications.map((notif) => (
//           <div
//             key={notif.id}
//             className="flex items-start p-3 hover:bg-lightBlue hover:rounded-md cursor-pointer"
//             onClick={() => handleNotificationClick(Number(notif.id))}
//           >
//             <div className="ml-3 flex-1">
//               <div className="flex items-center justify-between">
//                 <p className="text-sm font-semibold">{notif.notif_message}</p>
//                 {!notif.is_read && (
//                   <span className="w-2 h-2 bg-red-500 rounded-full"></span>
//                 )}
//               </div>
//               <p className="text-sm text-muted-foreground mt-1">
//                 From: {notif.sender}
//               </p>
//               <p className="text-xs text-muted-foreground mt-2">
//                 {dayjs(notif.created_at).fromNow()}
//               </p>
//             </div>
//           </div>
//         ))
//       ) : (
//         <div className="p-4 text-center text-muted-foreground">
//           No notifications available
//         </div>
//       )}
//     </div>
//   );

//   const notificationPopoverHeader = (
//     <div className="flex justify-between items-center">
//       <div className="flex items-center gap-x-2">
//         <p className="text-base font-medium text-black">Notifications</p>
//         {notifications.filter((n) => !n.is_read).length > 0 && (
//           <p className="flex items-center justify-center text-xs font-semibold text-white bg-red-500 w-5 h-5 rounded-full">
//             {notifications.filter((n) => !n.is_read).length}
//           </p>
//         )}
//       </div>
//       <DropdownLayout
//         trigger={
//           <div className="flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer hover:text-white hover:bg-darkBlue2">
//             <Ellipsis size={16} />
//           </div>
//         }
//         contentClassName="p-2"
//         options={[
//           {
//             id: "mark-as-read",
//             name: "Mark all as Read",
//             icon: <CheckCheck size={16} />,
//           },
//         ]}
//         onSelect={() => markAllAsRead()}
//       />
//     </div>
//   );

//   return (
//     <Popover>
//       <PopoverTrigger className="relative flex items-center">
//         <MailOpen size={22} />
//         {notifications.some((n) => !n.is_read) && (
//           <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//         )}
//       </PopoverTrigger>
//       <PopoverContent className="absolute right-0 top-2 p-0 w-80 z-50 bg-white rounded-md shadow-lg">
//         <CardLayout
//           cardClassName="px-2"
//           headerClassName="p-2"
//           description={notificationPopoverHeader}
//           contentClassName="p-0"
//           content={notificationPopover}
//         />
//       </PopoverContent>
//     </Popover>
//   );
// }
