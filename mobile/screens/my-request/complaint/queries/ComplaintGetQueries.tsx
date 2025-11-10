import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const getResidentComplaint = () => {
  return useQuery({
    queryKey: ["ResidentComplaintList"],
    queryFn: async () => {
      try {
        const res = await api.get("complaint/resident/list/");
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

