import { useQuery } from "@tanstack/react-query";
import { getSummonCaseList, getSummonScheduleList, getSummonCaseDetail, getSummonDates, 
    getSummonTimeSlots, getComplaintDetails, getLuponCaseList, getCouncilCaseList, getCouncilCaseDetail, getLuponCaseDetail} from "../requestAPI/summonGetAPI";
import { SummonDates, SummonTimeSlots, SummonCaseDetails, SummonCaseList, ScheduleList } from "../summon-types";


export const useGetSummonCaseList = (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    return useQuery<{results: SummonCaseList[], count: number}>({
        queryKey: ['summonCases', page, pageSize, searchQuery, statusFilter],
        queryFn:() => getSummonCaseList(page, pageSize, searchQuery, statusFilter),
        staleTime: 5000,
    })
}

export const useGetCouncilCaseList = (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    return useQuery<{results: SummonCaseList[], count: number}>({
        queryKey: ['councilCases', page, pageSize, searchQuery, statusFilter],
        queryFn:() => getCouncilCaseList(page, pageSize, searchQuery, statusFilter),
        staleTime: 5000,
    })
}

export const useGetLuponCaseList = (page: number, pageSize: number, searchQuery: string, statusFilter: string) => {
    return useQuery<{results: SummonCaseList[], count: number}>({
        queryKey: ['luponCases', page, pageSize, searchQuery, statusFilter],
        queryFn:() => getLuponCaseList(page, pageSize, searchQuery, statusFilter),
        staleTime: 5000,
    })
}

export const useGetSummonCaseDetails = (sc_id: string) => {
    return useQuery<SummonCaseDetails>({
        queryKey: ['summonCaseDetails', sc_id],
        queryFn: () => getSummonCaseDetail(sc_id),
        staleTime: 5000,
        enabled: !!sc_id, 
    });
}

export const useGetCouncilCaseDetails = (sc_id: string) => {
    return useQuery<SummonCaseDetails>({
        queryKey: ['councilCaseDetails', sc_id],
        queryFn: () => getCouncilCaseDetail(sc_id),
        staleTime: 5000,
        enabled: !!sc_id, 
    });
}

export const useGetLuponCaseDetails = (sc_id: string) => {
    return useQuery<SummonCaseDetails>({
        queryKey: ['luponCaseDetails', sc_id],
        queryFn: () => getLuponCaseDetail(sc_id),
        staleTime: 5000,
        enabled: !!sc_id, 
    });
}

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


export const useGetScheduleList = (sc_id: string) => {
     return useQuery<ScheduleList[]>({
        queryKey: ['schedList', sc_id],
        queryFn: () => getSummonScheduleList(sc_id),
        enabled: !!sc_id, 
        staleTime: 5000,
    });
}
  

























