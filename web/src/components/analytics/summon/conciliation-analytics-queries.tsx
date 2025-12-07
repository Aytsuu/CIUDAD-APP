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

export const useGetConciliationIncidentChart = () => {
    return useQuery({
        queryKey: ['conciliationIncidentChart'],
        queryFn: async () => {
            try {
                const res = await api.get('clerk/conciliation-incident-chart/')
                return res.data;
            } catch (err) {
                throw err;
            }  
        },
        staleTime: 5000
    })
}