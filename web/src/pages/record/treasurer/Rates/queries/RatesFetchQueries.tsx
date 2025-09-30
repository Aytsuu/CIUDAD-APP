import { useQuery } from "@tanstack/react-query";
import { getAnnualGrossSales, getPurposeAndRatePersonal, getPurposeAndRateServiceCharge, getPurposeAndRateBusinessPermit, getPurposeAndRate } from "../restful-API/RatesGetAPI";

export type AnnualGrossSales = {
    ags_id: string;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    ags_date: string;
    ags_is_archive: boolean;
    staff_name: string;
}

export const useGetAnnualGrossSales = () => {
    return useQuery<AnnualGrossSales[]>({
        queryKey: ["grossSales"],  
        queryFn: getAnnualGrossSales,
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

export const useGetPurposeAndRatePersonal = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["personalPurpose", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRatePersonal(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateServiceCharge = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["serviceChargePurpose", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateServiceCharge(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

export const useGetPurposeAndRateBusinessPermit = (page: number, pageSize: number, searchQuery: string) => {
    return useQuery<{results: PurposeAndRate[], count: number}>({
        queryKey: ["businessPermitPurpose", page, pageSize, searchQuery],  
        queryFn:() => getPurposeAndRateBusinessPermit(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    });
};

