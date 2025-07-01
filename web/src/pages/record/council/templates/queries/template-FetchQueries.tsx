import { useQuery } from "@tanstack/react-query";
import { getTemplateRecord } from "../request/template-GetRequest";
import { getPurposeRates } from "../request/template-GetRequest";



export type TemplateRecord = {
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
    temp_is_archive: boolean;
    pr_id: number;
    staff_id: number;
};
  


export const useGetTemplateRecord = () => {
    return useQuery<TemplateRecord[]>({
        queryKey: ["templateRec"],
        queryFn: getTemplateRecord,
        staleTime: 1000 * 60 * 30, // 30 minutes stale time
    });
};




export type PurposeRates = {
    pr_id: string;
    pr_purpose: string;
}

export const useGetPurposeRates= () => {
    return useQuery<PurposeRates[]>({
        queryKey: ["purposeRates"], 
        queryFn: getPurposeRates,
        staleTime: 1000 * 60 * 30,
    });
}