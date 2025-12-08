import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetRemarksAnalytics = () => {
    return useQuery({
        queryKey: ['remarksAnalytics'],
        queryFn: async () => {
            try {
                const res = await api.get('clerk/remarks-analytics/');
                return res.data;
            } catch (err) {
                throw err;
            }
        },
        staleTime: 5000
    })
}

export const useGetRemarksChartAnalytics = () => {
    return useQuery({
        queryKey: ['remarksChartAnalytics'],
        queryFn: async () => {
            try {
                const res = await api.get('clerk/remarks-chart/');
                return res.data;
            } catch (err) {
                throw err;
            }
        },
        staleTime: 5000
    })
}