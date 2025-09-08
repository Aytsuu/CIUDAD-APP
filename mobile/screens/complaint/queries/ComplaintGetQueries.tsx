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

export const useGetComplaintById = (id: string) => {
  return useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      try {
        const res = await api.get(`complaint/${id}`);
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 5000,
  });
};
