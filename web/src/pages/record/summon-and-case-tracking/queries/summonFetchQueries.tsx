import { useQuery } from "@tanstack/react-query";
import { getServiceChargeRequest } from "../requestAPI/summonGetAPI";

export type ServiceChargeRequest = {
    sr_id: string;
    complainant_name: string;
    accused_names: string;
    incident_type: string;
    allegation: string;
    status: string;
}


export const useGetServiceChargeRequest = () => {
    return useQuery<ServiceChargeRequest[]>({
        queryKey: ['summonCases'],
        queryFn: getServiceChargeRequest,
        staleTime: 1000 * 60 * 30,
    })
}