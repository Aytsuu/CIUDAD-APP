import { useQuery } from "@tanstack/react-query";
import { getServiceChargeRequest, getCaseDetails, getSummonTemplate, getSuppDoc } from "../requestAPI/summonGetAPI";

export type ServiceChargeRequest = {
    sr_id: string;
    sr_code: string;
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
    };
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

// export type CaseDetails = {
//     sr_id: string;
//     sr_status: string;
//     sr_decision_date: string;
//     complainant: {
//         cpnt_id: string;
//         cpnt_name: string;
//     };
//     complaint: {
//         comp_id: string;
//         comp_incident_type: string;
//         comp_allegation: string;
//         comp_datetime: string;
//         accused: {
//             acsd_id: string;
//             acsd_name: string;
//         }[];
//     };
//     case_activities: CaseActivity[];
// };

// export const useGetCaseDetails = (srId: string) => {
//     return useQuery<CaseDetails>({
//         queryKey: ['caseDetails', srId],
//         queryFn: () => getCaseDetails(srId),
//         enabled: !!srId, 
//         staleTime: 5000,
//     });
// };

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
  