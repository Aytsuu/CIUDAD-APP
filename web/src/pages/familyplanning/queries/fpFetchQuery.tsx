import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export const useRiskStiData = (patientId: string | number | undefined) => {
    return useQuery({
        queryKey: ["risk-sti", patientId],
        queryFn: async () => {
            const {data} = await api2.get(`family-planning/risk_sti/${patientId}`);
            return data;
        },
        enabled: !!patientId,
        staleTime: 60 * 30
    });
}


















