import { useQuery } from "@tanstack/react-query";
import { getServiceChargeRequest, getCaseDetails } from "../requestAPI/summonGetAPI";

export type ServiceChargeRequest = {
    sr_id: string;
    complainant_name: string;
    accused_names: string;
    incident_type: string;
    allegation: string;
    status: string;
}


export const useGetServiceChargeRequest = () => {
    return useQuery<ServiceChargeRequest[]>({
        queryKey: ['summonCases'],
        queryFn: getServiceChargeRequest,
        staleTime: 1000 * 60 * 30,
    })
}


export type CaseActivity = {
    ca_id: string;
    ca_reason: string;
    ca_hearing_date: string;
    ca_hearing_time: string;
    ca_issuance_date: string;
    file: {
        caf_id: string;
        caf_name: string;
        caf_url: string;
    };
};

export type CaseDetails = {
    sr_id: string;
    sr_status: string;
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
        staleTime: 1000 * 60 * 30,
    });
};


// import { useQuery } from "@tanstack/react-query";
// import { getServiceChargeRequest, getCaseDetails } from "../requestAPI/summonGetAPI";

// export type CaseActivity = {
//     ca_id: string;
//     ca_reason: string;
//     ca_hearing_date: string;
//     ca_hearig_time: string;
//     ca_date_of_issuance: string;
// }

// export type ServiceChargeRequest = {
//     sr_id: string;
//     complainant_name: string;
//     accused_names?: string[];
//     incident_type: string;
//     allegation: string;
//     status: string;
//     case_activities?: CaseActivity[]
// }

// export const useGetServiceChargeRequest = () => {
//     return useQuery<ServiceChargeRequest[]>({
//         queryKey: ['summonCases'],
//         queryFn: getServiceChargeRequest,
//         staleTime: 1000 * 60 * 30,
//     })
// }


// export const useGetCaseDetails = (sr_id: string) => {
//     return useQuery<ServiceChargeRequest>({
//         queryKey: ['caseDetails', sr_id],
//         queryFn: () => getCaseDetails(sr_id),
//         enabled: !!sr_id, 
//         staleTime: 1000 * 60 * 30,
//     });
// }
