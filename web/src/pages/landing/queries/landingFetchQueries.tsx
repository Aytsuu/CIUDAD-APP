import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useBrgyCouncil = () => { // DEPRECATING...
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

export const useLandingDetails = (id: number) => {
  return useQuery({
    queryKey: ['landingData'],
    queryFn: async () => {
      try {
        const res = await api.get(`landing/retrieve/${id}/`);
        return res.data;
      } catch(err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 10,
    retry: false
  })
}