// import { useState, useEffect, useRef } from 'react';
// import { NotificationBell } from './notification-bell';
// import { useNotifications, type Notification } from '@/context/NotificationContext';
// import { useAuth } from '@/context/AuthContext';

// export const NotificationDropdown = () => {
//   const {
//     notifications,
//     unreadCount,
//     markAsRead,
//     markAllAsRead,
//     isLoading,
//     error,
//   } = useNotifications();

//   const { user } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const handleNotificationClick = (notification: Notification) => {
//     if (!notification.is_read) {
//       markAsRead(notification.id);
//     }
//     setIsOpen(false);
//     // Optionally navigate: if (notification.url) router.push(notification.url);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen]);

//   const sortedNotifications = [...notifications].sort(
//     (a, b) =>
//       new Date(b.created_at || '').getTime() -
//       new Date(a.created_at || '').getTime()
//   );

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         aria-label="Notifications"
//         className="p-1 rounded-full hover:bg-gray-100 transition-colors relative"
//         aria-haspopup="true"
//         aria-expanded={isOpen}
//       >
//         <NotificationBell userId={user?.supabase_id ?? ''} />
//       </button>

//       {isOpen && (
//         <div
//           className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200"
//           role="menu"
//         >
//           <div className="p-3 border-b flex justify-between items-center">
//             <div className="flex items-center space-x-2">
//               <h3 className="font-medium">Notifications</h3>
//               {unreadCount > 0 && (
//                 <button
//                   onClick={markAllAsRead}
//                   className="text-xs text-blue-600 hover:underline"
//                 >
//                   Mark all as read
//                 </button>
//               )}
//             </div>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {isLoading ? (
//               <div className="p-4 text-center">Loading...</div>
//             ) : error ? (
//               <p className="p-4 text-red-500 text-center">
//                 {error}
//               </p>
//             ) : sortedNotifications.length === 0 ? (
//               <p className="p-4 text-gray-500 text-center">
//                 No notifications
//               </p>
//             ) : (
//               sortedNotifications.map((notification) => (
//                 <div
//                   key={notification.id}
//                   role="menuitem"
//                   className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
//                     !notification.is_read ? 'bg-blue-50' : ''
//                   }`}
//                   onClick={() => handleNotificationClick(notification)}
//                 >
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <div className="flex items-center space-x-1">
//                         {!notification.is_read && (
//                           <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
//                         )}
//                         <h4 className="font-medium text-sm">
//                           {notification.title || 'Notification'}
//                         </h4>
//                       </div>
//                       <p className="text-xs text-gray-600 mt-1 line-clamp-2">
//                         {notification.message || 'You have a new update.'}
//                       </p>
//                     </div>
//                     <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
//                       {notification.created_at
//                         ? new Date(notification.created_at).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit',
//                           })
//                         : 'Just now'}
//                     </span>
//                   </div>
//                   {notification.related_object_type && (
//                     <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
//                       {notification.related_object_type}
//                     </span>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
