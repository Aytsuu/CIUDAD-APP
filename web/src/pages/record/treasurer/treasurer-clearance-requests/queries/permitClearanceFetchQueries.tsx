import { useQuery } from "@tanstack/react-query";
import { getBusinesses, getPermitPurposes, getGrossSales, getPermitClearances,getAnnualGrossSalesForPermit,getPurposesAndRates } from "../restful-api/permitClearanceGetAPI";


export type Businesses = {
    bus_id: string;
    bus_name: string;
    bus_gross_sales: string;
    bus_location?: string;
    bus_date_of_registration: string;
    bus_date_verified: string;
    respondent: string;
    rp: string;
    address?: string; // derived from bus_location
    requestor?: string; 
}

export type Address = {
    add_id: number;
    add_province: string;
    add_city: string;
    add_barangay: string;
    add_street: string;
    sitio_id: string;
    add_external_sitio: string;
}

export type PermitPurposes = {
    pr_id: number;
    pr_purpose: string;
    pr_category: string;
    pr_rate: number;
}

export type GrossSales = {
    ags_id: number;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    ags_date: string;
    ags_is_archive: boolean;
}

export const useGetBusinesses = () => {
     return useQuery<Businesses[]>({
        queryKey: ["businesses"],  
        queryFn: getBusinesses,
        staleTime: 1000 * 60 * 30, 
    });
}

export const useGetPermitPurposes = () => {
     return useQuery<PermitPurposes[]>({
        queryKey: ["permitPurposes"],  
        queryFn: getPermitPurposes,
        staleTime: 1000 * 60 * 30, 
    });
}

export const useGetGrossSales = () => {
     return useQuery<GrossSales[]>({
        queryKey: ["grossSales"],  
        queryFn: getGrossSales,
        staleTime: 1000 * 60 * 30, 
    });
}

// Hook for permit clearances list
export const useGetPermitClearances = () => {
    return useQuery<any[]>({
        queryKey: ["permitClearances"],
        queryFn: getPermitClearances,
        staleTime: 1000 * 60 * 30,
    });
}

// Hook for annual gross sales (for permit clearance component)
export const useGetAnnualGrossSalesForPermit = () => {
    return useQuery<any[]>({
        queryKey: ["annualGrossSales"],
        queryFn: getAnnualGrossSalesForPermit,
        staleTime: 1000 * 60 * 30,
    });
}

// Hook for purposes and rates (for permit clearance component)
export const useGetPurposesAndRates = () => {
    return useQuery<any[]>({
        queryKey: ["purposes"],
        queryFn: getPurposesAndRates,
        staleTime: 1000 * 60 * 30,
    });
}


