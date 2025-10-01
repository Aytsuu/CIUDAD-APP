import { useQuery } from "@tanstack/react-query";
import { getAnnualGrossSalesActive, getAllAnnualGrossSales, getPurposeAndRatePersonalActive, getPurposeAndRateAllPersonal, 
    getPurposeAndRateServiceChargeActive, getPurposeAndRateAllServiceCharge
    , getPurposeAndRateBusinessPermitActive, getPurposeAndRateAllBusinessPermit, getPurposeAndRate } from "../restful-API/RatesGetAPI";

export type AnnualGrossSales = {
    ags_id: string;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    ags_date: string;
    ags_is_archive: boolean;
    staff_name: string;
}

export const useGetAnnualGrossSalesActive = (page?: number, pageSize?: number, searchQuery?: string) => {
    return useQuery<{results: AnnualGrossSales[], count: number}>({
        queryKey: ["grossSalesActive", page, pageSize, searchQuery],  
        queryFn: () => getAnnualGrossSalesActive( page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetAllAnnualGrossSales = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: AnnualGrossSales[], count: number}>({
        queryKey: ["allGrossSales", page, pageSize, searchQuery],  
        queryFn: () => getAllAnnualGrossSales( page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

// Purpose and Rates
export type PurposeAndRate = {
    pr_id: string;
    pr_purpose: string;
    pr_rate: number;
    pr_category: string;
    pr_date: string;
    pr_is_archive: boolean;
    staff_name: string;
}
export const useGetPurposeAndRate = () => {
    return useQuery<PurposeAndRate[]>({
        queryKey: ["personalPurpose"],  
        queryFn: getPurposeAndRate,
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRatePersonalActive = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["personalActive", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRatePersonalActive(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateAllPersonal= (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["allPersonal", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateAllPersonal(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateServiceChargeActive = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["serviceChargeActive", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateServiceChargeActive(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateAllServiceCharge = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["allServiceCharge", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateAllServiceCharge(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateBusinessPermitActive = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["businessPermitActive", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateBusinessPermitActive(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateAllBusinessPermit = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["allBusinessPermit", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateAllBusinessPermit(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

