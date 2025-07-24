import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetGarbageCardAnalytics = () => {
    return useQuery({
        queryKey: ['garbagePickupAnalytics'],
        queryFn: async () => {
        try {
            const res = await api.get('waste/garbage-pickup-request-analytics');
            console.log('garbage pickup reqs: ', res.data)
            return res.data;
        } catch (err) {
            throw err;
        }
        },
        staleTime: 5000
    })
}