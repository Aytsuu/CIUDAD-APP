import { createContext, useContext, useEffect, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/supabase/supabase";
import { api } from "@/api/api";

type Notification = {
    id: string;
    django_id: number;
    title: string;
    message: string;
    notification_type: 'info' | 'success' | 'warning' | 'error';
    created_at: string;
    is_read: boolean;
    related_object_type?: string;
    related_object_id?: number;
};

const NotificationContext = createContext<{
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}>({
    notifications: [],
    unreadCount: 0,
    markAsRead: async () => {},
    fetchNotifications: async () => {},
});

export const NotificationProvider = ({children}: {children: React.ReactNode}) => {
    const {user} = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    const fetchNotifications = async () => {
        if (!user?.id) return;
        
        // First try Supabase
        const { data: supabaseData, error } = await supabase
            .from('notification')
            .select('*')
            .eq('recipient_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error || !supabaseData?.length) {
            // Fallback to Django API
            const response = await api.get('/notification/list/');
            setNotifications(response.data);
        } else {
            setNotifications(supabaseData);
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        fetchNotifications();

        // Setup realtime listener
        const newChannel = supabase
            .channel(`notification_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setNotifications(prev => [payload.new as Notification, ...prev]);
                        // Play sound for new notifications
                        new Audio('/sounds/notification.mp3').play();
                    } else if (payload.eventType === 'UPDATE') {
                        setNotifications(prev => 
                            prev.map(n => n.id === payload.new.id ? payload.new as Notification : n)
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        setChannel(newChannel);

        return () => {
            channel?.unsubscribe();
        };
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );

        // Update in Supabase
        await supabase
            .from('notification')
            .update({ is_read: true })
            .eq('id', id);

        // Sync with Django
        try {
            const notification = notifications.find(n => n.id === id);
            if (notification?.django_id) {
                await api.patch(`/notification/${notification.django_id}/mark_read/`);
            }
        } catch (error) {
            console.error('Failed to sync read status with Django:', error);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount: notifications.filter(n => !n.is_read).length,
                markAsRead,
                fetchNotifications,
            }}
        >  
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);