import { useQuery } from "@tanstack/react-query";
import { getSummonDates, getSummonTimeSlots } from "../restful-api/SummonGetApi.";

export type SummonDates = {
    sd_id: number;
    sd_date: string;
}

export const useGetSummonDates = () => {
    return useQuery<SummonDates[]>({
        queryKey: ['summonDates'],
        queryFn: getSummonDates,
        staleTime: 5000
    })
}


export type SummonTimeSlots = {
    st_id?: number;
    st_start_time: string;
    st_end_time: string;
    sd_id?: number;
    st_is_booked?: boolean;
}

export const useGetSummonTimeSlots = (sd_id: number) => {
    return useQuery<SummonTimeSlots[]>({
        queryKey: ['summonTimeSlots', sd_id],
        queryFn: () => getSummonTimeSlots(sd_id),
        staleTime: 5000
    })
}
