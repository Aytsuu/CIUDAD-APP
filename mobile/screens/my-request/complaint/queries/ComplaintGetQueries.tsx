import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const getComplaintLists = () => {
  return useQuery({
    queryKey: ["ComplaintList"],
    queryFn: async () => {
      try {
        const res = await api.get("complaint/list/");
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5000,
  });
};

export const useGetComplaintById = (complaintId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: async () => {
      try {
        const res = await api.get(`complaint/view/`, {
          params: { comp_id: complaintId }  
        });
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5000,
    enabled: options?.enabled !== false && !!complaintId, 
  });
};

