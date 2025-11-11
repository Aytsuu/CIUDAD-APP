import { CouncilMediationCalendarCase } from "../summon-types";
import { getMediationSchedules } from "../api/summonGet-API";
import { useQuery } from "@tanstack/react-query";

export const useGetMediationSchedules = () => {
    return useQuery<CouncilMediationCalendarCase[]>({
        queryKey: ['mediationSchedules'],
        queryFn: getMediationSchedules,
        staleTime: 5000
    })
}