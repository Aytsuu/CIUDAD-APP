import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

interface Notification {
  notif_id: string;
  notif_title: string;
  notif_message: string;
  is_read: boolean;
  notif_created_at: string;
  metadata?: {
    type?: string;
    url?: string;
    sender_name?: string;
    sender_avatar?: string;
  };
  resident?: {
    rp_id: string;
    name?: string;
  };
}

export const fetchNotification = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.get('notification/list/');
        
        // The backend returns an array of notifications
        if (!res.data) {
          return [];
        }
        
        return res.data;
      } catch (err: any) {
        throw new Error(
          err?.response?.data?.message || 
          'Failed to fetch notifications'
        );
      }
    },
    staleTime: 5000, 
    refetchInterval: 30000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2, // Retry failed requests twice
  });
};