import { useQuery } from "@tanstack/react-query";
// import { getRiskSti } from "../request-db/GetRequest";   
import { api } from "@/api/api";

// export const useFPRecord = () => {
//     return useQuery({
//         queryKey: ["fp"],
//         queryFn: getFP,
//         staleTime: 60*30
//     });
//     };

export const useRiskStiData = (patientId: string | number | undefined) => {
    return useQuery({
        queryKey: ["risk-sti", patientId],
        queryFn: async () => {
            const {data} = await api.get(`family-planning/risk_sti/${patientId}`);
            return data;
        },
        enabled: !!patientId,
        staleTime: 60 * 30
    });
}