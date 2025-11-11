import { useQuery } from "@tanstack/react-query";
import { getCertificates, getCertificateById, searchCertificates, getPersonalClearances, getPurposeAndRates, getAnnualGrossSales, getBusinessByResidentId, checkResidentVoterId } from "../restful-API/certificationReqGetAPI";

export interface PurposeAndRate {
    pr_id: number;
    pr_purpose: string;
    pr_rate: number;
    pr_category: string;
    pr_date: string;
    pr_is_archive: boolean;
}

export interface AnnualGrossSales {
    ags_id: number;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    ags_date: string;
    ags_is_archive: boolean;
}

// Query hooks for fetching data
export const usePurposeAndRates = () => {
    return useQuery<PurposeAndRate[]>({
        queryKey: ["purpose-and-rates"],
        queryFn: getPurposeAndRates,
    });
};

export const useAnnualGrossSales = () => {
    return useQuery<AnnualGrossSales[]>({
        queryKey: ["annual-gross-sales"],
        queryFn: getAnnualGrossSales,
    });
};

// Existing certificate queries
export const useGetCertificates = () => {
    return useQuery({
        queryKey: ['certificates'],
        queryFn: getCertificates,
    });
};

export const useGetCertificateById = (crId: string) => {
    return useQuery({
        queryKey: ['certificate', crId],
        queryFn: () => getCertificateById(crId),
        enabled: !!crId,
    });
};

export const useSearchCertificates = (query: string) => {
    return useQuery({
        queryKey: ['certificates', 'search', query],
        queryFn: () => searchCertificates(query),
        enabled: !!query,
    });
};

export const useGetPersonalClearances = () => {
    return useQuery({
        queryKey: ['personal-clearances'],
        queryFn: getPersonalClearances,
    });
};

// Business types
export interface Business {
    bus_id: number;
    bus_name: string;
    bus_gross_sales: number;
    bus_street: string;
    bus_location: string;
    sitio: string;
    bus_date_verified: string | null;
    bus_status: string;
}


export interface BusinessResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Business[];
}


export const useBusinessByResidentId = (rpId: string) => {
    return useQuery<BusinessResponse>({
        queryKey: ["business-by-resident", rpId],
        queryFn: () => getBusinessByResidentId(rpId),
        enabled: !!rpId, 
    });
};

// Check if resident has voter ID
export const useResidentVoterId = (rpId: string | undefined, userPersonalData?: any) => {
    return useQuery<boolean>({
        queryKey: ["resident-voter-id", rpId],
        queryFn: () => checkResidentVoterId(rpId || "", userPersonalData),
        enabled: !!rpId,
        retry: false,
    });
};
