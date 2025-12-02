import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetConciliationAnalytics = () => {
    return useQuery({
        queryKey: ['conciliationAnalytics'],
        queryFn: async () => {
            try {
                const res = await api.get('clerk/conciliation-analytics/');
                return res.data;
            } catch (err) {
                throw err;
            }
        },
        staleTime: 5000
    })
}