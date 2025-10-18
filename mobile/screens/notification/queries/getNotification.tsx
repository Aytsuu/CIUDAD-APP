import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export default function GetNotification() {
  return useQuery({
    queryKey: ["notifications"], 
    queryFn: async () => {
      const response = await api.get("/notification/list/");
      console.log("📬 Notification data fetched:", response.data.length);
      return response.data;
    },
    staleTime: 1000 * 60 * 1, 
    refetchOnWindowFocus: true, 
    refetchOnMount: true,
    refetchOnReconnect: true, 
  });
}