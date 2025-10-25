import { useQuery } from "@tanstack/react-query"
import { getSummonDates, getSummonTimeSlots } from "../restful-API/scheduleGetAPI"
import { SummonDates, SummonTimeSlots } from "../types"

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