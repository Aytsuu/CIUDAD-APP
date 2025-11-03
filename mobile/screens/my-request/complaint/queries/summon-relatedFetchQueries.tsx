import { useQuery } from "@tanstack/react-query"
import { getSummonDates, getSummonTimeSlots, getCaseTrackingDetails, getSummonScheduleList } from "../restful-API/summon-relatedGetAPI"
import { CaseTrackingType, SummonDates, SummonTimeSlots, ScheduleList } from "../types"

export const useGetSummonDates = () => {
    return useQuery<SummonDates[]>({
        queryKey: ['summonDates'],
        queryFn: getSummonDates,
        staleTime: 5000
    })
}


export const useGetSummonTimeSlots = (sd_id: number) => {
    return useQuery<SummonTimeSlots[]>({
        queryKey: ['summonTimeSlots', sd_id],
        queryFn: () => getSummonTimeSlots(sd_id),
        staleTime: 5000
    })
}

export const useGetCaseTrackingDetails = (comp_id: string) => {
    return useQuery<CaseTrackingType>({
        queryKey: ['caseTrackingDetails', comp_id],
        queryFn: () => getCaseTrackingDetails(comp_id),
        staleTime: 5000
    })
}

export const useGetScheduleList = (sc_id: string) => {
     return useQuery<ScheduleList[]>({
        queryKey: ['schedList', sc_id],
        queryFn: () => getSummonScheduleList(sc_id),
        enabled: !!sc_id, 
        staleTime: 5000,
    });
}