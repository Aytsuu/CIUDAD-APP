import { useQuery } from "@tanstack/react-query";
import { getSummonCaseList, getSummonScheduleList, getSummonCaseDetail, getSummonDates, 
    getSummonTimeSlots, getComplaintDetails, getLuponCaseList, getCouncilCaseList, getCouncilCaseDetail, getLuponCaseDetail, getFileActionPaymentLogs} from "../requestAPI/summonGetAPI";
import { SummonDates, SummonTimeSlots, SummonCaseDetails, SummonCaseList, ScheduleList, PaymentRequest } from "../summon-types";


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

export const useGetFileActionPaymentLogs = (comp_id: string) => {
    return useQuery<PaymentRequest[]>({
        queryKey: ['fileActionPayLogs', comp_id],
        queryFn: () => getFileActionPaymentLogs(comp_id),
        enabled: !!comp_id, 
        staleTime: 5000,
    });
}
  
export interface ResidentProfile {
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  address?: string;
  contact_number?: string;
  email?: string;
}

export interface PersonType {
  res_profile?: ResidentProfile;
  cpnt_name?: string;
  cpnt_gender?: string;
  cpnt_address?: string;
  cpnt_relation_to_respondent?: string;
  cpnt_number?: string | number;
  cpnt_id?: string | number;
  cpnt_contact?: string;
  acsd_name?: string;
  acsd_address?: string;
  acsd_age?: string;
  acsd_gender?: string;
  acsd_description?: string;
  acsd_id?: string | number;
  acsd_contact?: string;
  rp_id?: string | number;
}

interface Complainant {
  cpnt_id: number;
  res_profile: ResidentProfile;
  cpnt_name: string;
  cpnt_gender: string;
  cpnt_age: string;
  cpnt_number: string;
  cpnt_relation_to_respondent: string;
  cpnt_address: string;
  rp_id: string;
}

export interface Accused {
  acsd_id: number;
  res_profile: ResidentProfile;
  acsd_name: string;
  acsd_age: string;
  acsd_gender: string;
  acsd_description: string;
  acsd_address: string;
  rp_id: string;
}

export interface ComplaintFile {
  file_name?: string;
  file_type?: string;
  file_url?: string;
  uploaded_at?: string;
}

export interface ComplaintData {
  comp_id: number;
  comp_incident_type: string;
  comp_location: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_created_at: string;
  comp_rejection_reason: string;
  complainant: Complainant[];
  accused: Accused[];
  complaint_files: ComplaintFile[];
  comp_status: string;
  staff: any;
}

export const useGetComplaintDetails = (comp_id: string) => {
    return useQuery<ComplaintData>({
        queryKey: ['complaintDetails', comp_id],
        queryFn: () => getComplaintDetails(comp_id),
        staleTime: 5000
    })
}























