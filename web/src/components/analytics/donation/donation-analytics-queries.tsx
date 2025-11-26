import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const  useGetDonCardAnalytics = () => {
  return useQuery({
    queryKey: ['donationCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get('donation/total-monetary/');
        // console.log(res.data)
        return res.data
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}