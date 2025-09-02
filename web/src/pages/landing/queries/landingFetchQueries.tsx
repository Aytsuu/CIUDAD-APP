import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useBrgyCouncil = () => {
  return useQuery({
    queryKey: ['brgyCouncil'],
    queryFn: async () => {
      try {
        const res = await api.get('administration/staff/landing-page/');
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}
