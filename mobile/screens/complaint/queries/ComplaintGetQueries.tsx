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

