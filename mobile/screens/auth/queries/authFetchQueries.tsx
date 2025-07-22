import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetAccountEmailList = () => {
  return useQuery({
    queryKey: ["accEmailList"],
    queryFn: async () => {
      try {
        const res = await api.get('account/email/list/');
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}