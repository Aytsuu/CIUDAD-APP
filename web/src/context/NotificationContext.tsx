// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { NotificationService } from '@/services/notification_services';
// import { useAuth } from './AuthContext';
// import { NotificationContextType, Notification, CreateNotificationPayload } from './auth-types';

// const NotificationContext = createContext<NotificationContextType>({
//   notifications: [],
//   unreadCount: 0,
//   markAsRead: async (_id: string) => {},
//   send: async (_payload) => {},
//   refresh: async () => {},
// })

// export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
//   children
// }) => {
//   const [notifications, setNotifications] = useState<Notification[]>([])
//   const { user } = useAuth()
//   const service = NotificationService.getInstance();

//   const loadNotifications = async () => {
//     if(!user?.acc_id) return;

//     try{
//       const data = await service.getUserNotifications(user.acc_id);
//       setNotifications(data);
//     }catch(error){
//       console.error('Failed to load notifications: ', error)
//     }
//   };

//   useEffect(() => {
//     loadNotifications();

//     if(!user?.acc_id) return;

//     const handleNewNotification = (notification: Notification) => {
//       setNotifications(prev => [notification, ...prev]);
//     };

//     service.subscribeToUserNotifications(user.acc_id, handleNewNotification);

//     return () => {
//       service.unsubscribeAll();
//     };
//     }, [user?.acc_id]);
    
//     const sendNotification = async (payload: CreateNotificationPayload) => {
//       if (!user?.acc_id) throw new Error('User not authenticated');;
//       await service.create(payload, user.acc_id);
//     };

//     const markAsRead = async (id: string) => {
//       if(!user?.acc_id) return;
//       await service.markAsRead(id, user.acc_id);
//       setNotifications(prev => 
//         prev.map(n => n.id === id ?  {...n, is_read: true } : n)
//       );
//     };

//     const unreadCount = notifications.filter(n => !n.is_read).length;

//     return (
//        <NotificationContext.Provider value={{
//       notifications,
//       unreadCount,
//       send: sendNotification,
//       markAsRead,
//       refresh: loadNotifications
//     }}>
//       {children}
//     </NotificationContext.Provider>
//   );
// }

// export const useNotifications = () => useContext(NotificationContext);