import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const getComplaintLists = (status?: string) => {
  return useQuery({
    queryKey: ["ComplaintList", status],
    queryFn: async () => {
      try {
        const res = await api.get("complaint/list/", {
          params: {status},
        });
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5000,
  });
};

export const useGetComplaintById = (id: string) => {
  return useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      try {
        const res = await api.get(`complaint/${id}`, {
          params: {id},
        });
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5000,
  });
};
