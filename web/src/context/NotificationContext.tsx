// import { createContext, useContext, useEffect, useState } from "react";
// import { useAuth } from "./AuthContext";
// import supabase from "@/supabase/supabase";
// import { api } from "@/api/api";

// export type Notification = {
//   id: number;
//   title: string;
//   message: string;
//   is_read: boolean;
//   recipient_id?: string;
//   created_at?: string;
//   django_id?: number; // Make sure Django includes this in the payload
//   related_object_type?: string;
// };

// const NotificationContext = createContext<{
//   notifications: Notification[];
//   unreadCount: number;
//   isLoading: boolean;
//   error: string | null;
//   markAsRead: (id: number) => Promise<void>;
//   markAllAsRead: () => Promise<void>;
//   fetchNotifications: () => Promise<void>;
// }>({
//   notifications: [],
//   unreadCount: 0,
//   isLoading: false,
//   error: null,
//   markAsRead: async () => {},
//   markAllAsRead: async () => {},
//   fetchNotifications: async () => {},
// });

// export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchNotifications = async () => {
//     if (!user?.supabase_id) return;

//     setIsLoading(true);
//     setError(null);

//     try {
//       const { data: supabaseData, error: supabaseError } = await supabase
//         .from("notification")
//         .select("*")
//         .eq("recipient_id", user.supabase_id)
//         .order("created_at", { ascending: false });

//       if (supabaseError || !supabaseData?.length) {
//         const response = await api.get("notification/list/");
//         setNotifications(response.data);
//       } else {
//         setNotifications(supabaseData);
//       }
//     } catch (err: any) {
//       setError("Failed to load notifications");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const markAsRead = async (id: number) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );

//     await supabase.from("notification").update({ is_read: true }).eq("id", id);

//     try {
//       const notification = notifications.find((n) => n.id === id);
//       if (notification?.django_id) {
//         await api.patch(`/notification/${notification.django_id}/mark_read/`);
//       }
//     } catch (error) {
//       console.error("Failed to sync read status with Django:", error);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

//     await supabase
//       .from("notification")
//       .update({ is_read: true })
//       .eq("recipient_id", user?.supabase_id);

//     try {
//       await api.patch("/notification/mark_all_read/");
//     } catch (error) {
//       console.error("Failed to sync mark all read with Django:", error);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, [user?.supabase_id]);

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         unreadCount: notifications.filter((n) => !n.is_read).length,
//         isLoading,
//         error,
//         markAsRead,
//         markAllAsRead,
//         fetchNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export const useNotifications = () => useContext(NotificationContext);


import React, { createContext, useContext, useEffect, useState } from 'react';
import { NotificationService } from '@/services/notification_services';
import supabase from '@/supabase/supabase';
import { useAuth } from './AuthContext';
import { NotificationContextType, Notification } from './auth-types';
import { AuthSession } from '@supabase/supabase-js';

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {}
})

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [session, setSession] = useState<AuthSession | null>(null)
  const notificationService = NotificationService.getInstance()

  useEffect(() =>{
    supabase.auth.getSession().then(({data: { session } }) => {
      setSession(session)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return

    // Load initial notifications
    const loadNotifications =async () => {
      const initialNotifications = await notificationService.getUserNotifications(session.user.id)
      setNotifications(initialNotifications)
    }
    loadNotifications

    // Subscribe to realtime updates
    notificationService.subscribeToRealtime(session.user.id, (newNotification) => {
      setNotifications((prev: Notification[]) => [newNotification, ...prev])
    })

    return () => {
      notificationService.unsubscribeAll()
    }
  }, [session])

  const markAsRead = async (id: string) => {
    if(!session?.user?.id) return

    await notificationService.markAsRead(id, session.user.id)
    setNotifications(prev => 
    prev.map(n => n.id === id ? {...n, is_read: true} : n)
    )
  }

  const unreadCount = notifications.filter(n => !n.is_read).length
  
  return(
    <NotificationContext.Provider value={{notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)