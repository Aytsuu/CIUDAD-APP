import { useQuery } from "@tanstack/react-query";
import { getSummonCaseList, getSummonScheduleList, getSummonSuppDoc, getSummonCaseDetail, getSummonTemplate, getSuppDoc, getSummonDates, 
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
  









export type SupportingDoc = {
  ssd_id: number;
  ssd_name: string;
  ssd_type: string;
  ssd_path: string;
  ssd_url: string;
  ssd_upload_date: string; 
};

export const useGetSummonSuppDoc = (ss_id: string) => {
    return useQuery<SupportingDoc[]>({
        queryKey: ['summonSuppDoc', ss_id],
        queryFn:() => getSummonSuppDoc(ss_id),
        staleTime: 5000,
    })
}

export type ResidentProfileBase = {
  [key: string]: any;
};

export type Complaint = {
  comp_incident_type: string;
  complainant: Complainant[];
  accused_persons: Accused[];
  staff: any | null; 
};


export type ComplaintFile = {
    comp_file_id: string;
    comp_file_name: string;
    comp_file_type: string;
    comp_file_url: string;
}

export type Complainant = {
    cpnt_id: string;
    cpnt_name: string;
    cpnt_gender: string;
    cpnt_age: string;
    cpnt_number: string;
    cpnt_relation_to_respondent: string;
    cpnt_address: string;
    rp_id: string;
}

export type Accused = {
    acsd_id: string;
    acsd_name: string;
    acsd_age: string;
    acsd_gender: string;
    acsd_description: string;
    acsd_address: string;
}

export type Staff = {
    staff_id: string;
    staff_name: string;
}

export type ComplaintDetails = {
    comp_id: string;
    comp_incident_type: string;
    comp_allegation: string;
    comp_location: string;
    comp_datetime: string;
    comp_created_at: string;
    comp_rejection_reason: string;
    comp_status: string;
    complainant: Complainant[];  
    accused: Accused[];          
    complaint_files: ComplaintFile[];  
    staff: Staff | null;
}

export const useGetComplaintDetails = (comp_id: string) => {
    return useQuery<ComplaintDetails>({
        queryKey: ['complaintDetails', comp_id],
        queryFn: () => getComplaintDetails(comp_id),
        staleTime: 5000
    })
}













