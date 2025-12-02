import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetMediationAnalytics = () => {
    return useQuery({
        queryKey: ['mediationAnalytics'],
        queryFn: async () => {
            try {
                const res = await api.get('clerk/mediation-analytics/');
                return res.data;
            } catch (err) {
                throw err;
            }
        },
        staleTime: 5000
    })
}