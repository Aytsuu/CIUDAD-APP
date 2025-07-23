import { useQuery } from "@tanstack/react-query";
import { getAnnualGrossSales, getPurposeAndRate } from "../restful-API/ratesGetAPI";

export type AnnualGrossSales = {
    ags_id: string;
    ags_minimum: number;
    ags_maximum: number;
    ags_rate: number;
    ags_date: string;
    ags_is_archive: boolean;
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
}

export const useGetPurposeAndRate = () => {
    return useQuery<PurposeAndRate[]>({
        queryKey: ["purposeRates"],  
        queryFn: getPurposeAndRate,
        staleTime: 1000 * 60 * 30, 
    });
};

