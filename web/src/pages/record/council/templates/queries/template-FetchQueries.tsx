import { useQuery } from "@tanstack/react-query";
import { getTemplateRecord } from "../request/template-GetRequest";
import { getPurposeRates } from "../request/template-GetRequest";



export type TemplateRecord = {
    temp_id: number;
    temp_contact_num: string,
    temp_email: string;
    staff_id: number;
    template_files: {  
        tf_id: number;
        tf_url: string;
        tf_name: string;
        tf_logoType: string;
    }[];
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
    pr_is_archive: boolean;
}

export const useGetPurposeRates= () => {
    return useQuery<PurposeRates[]>({
        queryKey: ["purposeRates"], 
        queryFn: getPurposeRates,
        staleTime: 1000 * 60 * 30,
    });
}