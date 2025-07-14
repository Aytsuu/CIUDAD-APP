import { useQuery } from "@tanstack/react-query";
import { getServiceChargeRequest, getCaseDetails, getServiceChargeTemplates, getSuppDoc } from "../requestAPI/summonGetAPI";

export type ServiceChargeRequest = {
    sr_id: string;
    complainant_name: string;
    accused_names: string[];
    incident_type: string;
    allegation: string;
    status: string;
    decision_date: string;
}

export const useGetServiceChargeRequest = () => {
    return useQuery<ServiceChargeRequest[]>({
        queryKey: ['summonCases'],
        queryFn: getServiceChargeRequest,
        staleTime: 5000,
    })
}

export type CaseActivity = {
    ca_id: string;
    ca_reason: string;
    ca_hearing_date: string;
    ca_hearing_time: string;
    ca_date_of_issuance: string;
    srf: {
        srf_id: string;
        srf_name: string;
        srf_url: string;
    };
};

export type CaseDetails = {
    sr_id: string;
    sr_status: string;
    sr_decision_date: string;
    complainant: {
        cpnt_id: string;
        cpnt_name: string;
    };
    complaint: {
        comp_id: string;
        comp_incident_type: string;
        comp_allegation: string;
        comp_datetime: string;
        accused: {
            acsd_id: string;
            acsd_name: string;
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


export type ServiceChargeTemplates = {
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

export const useGetServiceChargeTemplates = () => {
    return useQuery<ServiceChargeTemplates[]>({
        queryKey: ['templateRec'],
        queryFn: getServiceChargeTemplates,
        staleTime: 5000
    })
}
  