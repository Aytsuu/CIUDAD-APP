import { useQuery } from "@tanstack/react-query"
import { getSummonDates, getSummonTimeSlots, getCaseTrackingDetails } from "../restful-API/summon-relatedGetAPI"
import { CaseTrackingType, SummonDates, SummonTimeSlots } from "../types"

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