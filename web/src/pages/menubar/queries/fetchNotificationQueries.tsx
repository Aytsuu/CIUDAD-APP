import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const fetchNotification = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await api.get('notification/list/');
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
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 2, // Retry failed requests twice
  })
};