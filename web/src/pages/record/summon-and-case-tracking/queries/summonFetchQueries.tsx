import { useQuery } from "@tanstack/react-query";
import { getSummonCaseList, getSummonScheduleList, getCaseDetails, getSummonTemplate, getSuppDoc, getSummonDates, 
    getSummonTimeSlots, getSummonReqPendingList, getComplaintDetails, getSummonReqRejectedList, getSummonReqAcceptedList} from "../requestAPI/summonGetAPI";

export type SummonCaseList = {
    sr_id: string;
    sr_code: string;
    complainant_names: string[];
    accused_names: string[];
    incident_type: string;
    sr_case_status: string;
    decision_date: string;
    comp_id: string;
}

export const useGetSummonCaseList = () => {
    return useQuery<SummonCaseList[]>({
        queryKey: ['summonCases'],
        queryFn: getSummonCaseList,
        staleTime: 5000,
    })
}

export type ScheduleList = {
    ss_id: string;
    ss_mediation_level: string;
    ss_is_rescheduled: boolean;
    ss_reason: string;
    hearing_date: string;
    hearing_time: string;
}


export const useGetScheduleList = (sr_id: string) => {
     return useQuery<ScheduleList[]>({
        queryKey: ['schedList', sr_id],
        queryFn: () => getSummonScheduleList(sr_id),
        enabled: !!sr_id, 
        staleTime: 5000,
    });
}

export type CaseSuppDoc = {
    csd_id: string;
    csd_name: string;
    csd_url: string;
    csd_description: string;
    csd_upload_date: string;
};

export const useGetSuppDoc = (ca_id: string) => {
    return useQuery<CaseSuppDoc[]>({
        queryKey: ['suppDocs', ca_id],
        queryFn: () => getSuppDoc(ca_id),
        enabled: !!ca_id, 
        staleTime: 5000,
    });
}


export type SummonTemplate = {
    temp_id: number,
    temp_header: string;
    temp_below_headerContent: string;
    temp_title: string;
    temp_subtitle: string;
    temp_w_sign: boolean;
    temp_w_seal: boolean;
    temp_w_summon: boolean;
    temp_paperSize: string;
    temp_margin: string;
    temp_filename: string;
    temp_body: string;
};

export const useGetSummonTemplate = () => {
    return useQuery<SummonTemplate>({
        queryKey: ['summonTemp'],
        queryFn: getSummonTemplate,
        staleTime: 5000
    })
}
  

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

export type SummonReqPendingList = {
    sr_id: string;
    sr_req_date: string;
    comp_id: string;
    complainant_names: string[]
    incident_type: string;
    accused_names: string [];
}

export const useGetSummonReqPendingList = () => {
    return useQuery<SummonReqPendingList[]>({
        queryKey: ['summonPendingReq'],
        queryFn: getSummonReqPendingList,
        staleTime: 5000
    })
}

export type SummonReqRejectedList = {
    sr_id: string;
    sr_req_date: string;
    comp_id: string;
    complainant_names: string[]
    incident_type: string;
    accused_names: string [];
    rejection_reason: string;
    decision_date: string;
}

export const useGetSummonReqRejectedList = () => {
    return useQuery<SummonReqRejectedList[]>({
        queryKey: ['summonRejectedReq'],
        queryFn: getSummonReqRejectedList,
        staleTime: 5000
    })
}

export type SummonReqAcceptedList = {
    sr_id: string;
    sr_req_date: string;
    comp_id: string;
    complainant_names: string[]
    incident_type: string;
    accused_names: string [];
    rejection_reason: string;
    decision_date: string;
}

export const useGetSummonReqAcceptedList = () => {
    return useQuery<SummonReqAcceptedList[]>({
        queryKey: ['summonAcceptedReq'],
        queryFn: getSummonReqAcceptedList,
        staleTime: 5000
    })
}

export type ComplaintDetails = {
    comp_id: string;
    comp_incident_type: string;
    comp_allegation: string;
    comp_location: string;
    comp_datetime: string;
    comp_created_at: string;
    complainant: string [];
    accused_persons: string [];
    complaint_files: string [];
}

export const useGetComplaintDetails = (comp_id: string) => {
    return useQuery<ComplaintDetails>({
        queryKey: ['complaintDetails', comp_id],
        queryFn: () => getComplaintDetails(comp_id),
        staleTime: 5000
    })
}

// =========== MIGHT DELETE THIS LATER ===================
export type CaseActivity = {
    ca_id: string;
    ca_reason: string;
    ca_hearing_date: string;
    ca_hearing_time: string;
    ca_mediation: string;
    ca_date_of_issuance: string;
    srf_detail: {
        srf_id: string;
        srf_name: string;
        srf_url: string;
    };
};

export type FormattedAddress = string;

export type AddressDetails = {
    add_province: string;
    add_city: string;
    add_barangay: string;
    add_street: string;
    sitio_name?: string;
    add_external_sitio?: string;
    formatted_address: FormattedAddress; // Add this new field
};

export type CaseDetails = {
    sr_id: string;
    sr_code: string;
    sr_status: string;
    sr_decision_date: string;
    complainant: {
        cpnt_id: string;
        cpnt_name: string;
        address: AddressDetails;
    }[];
    complaint: {
        comp_id: string;
        comp_incident_type: string;
        comp_allegation: string;
        comp_datetime: string;
        accused: {
            acsd_id: string;
            acsd_name: string;
            address: AddressDetails;
        }[];
    };
    case_activities: CaseActivity[];
};

export const useGetCaseDetails = (srId: string) => {
    return useQuery<CaseDetails>({
        queryKey: ['caseDetails', srId],
        queryFn: () => getCaseDetails(srId),
        enabled: !!srId, 
        staleTime: 5000,
    });
};