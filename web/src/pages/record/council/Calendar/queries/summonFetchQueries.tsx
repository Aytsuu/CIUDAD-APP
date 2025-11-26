import { SummonCalendarCase } from "../summon-types";
import { getMediationSchedules, getConciliationSchedules } from "../api/summonGet-API";
import { useQuery } from "@tanstack/react-query";

export const useGetMediationSchedules = () => {
    return useQuery<SummonCalendarCase[]>({
        queryKey: ['mediationSchedules'],
        queryFn: getMediationSchedules,
        staleTime: 5000
    })
}

export const useGetConciliationSchedules = () => {
    return useQuery<SummonCalendarCase[]>({
        queryKey: ['conciliationSchedules'],
        queryFn: getConciliationSchedules,
        staleTime: 5000
    })
}