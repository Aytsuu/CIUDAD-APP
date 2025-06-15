import { useQuery } from "@tanstack/react-query";
import { getResolution } from "../request/resolution-get-request";

export interface ResolutionData{
    res_num: number;
    res_title: string;
    res_date_approved: string;
    res_area_of_focus: string[];
    res_is_archive: boolean;
    resolution_files: {
        rf_id: number;
        rf_url: string;
    }[];
}

export const useResolution = () => {
    return useQuery<ResolutionData[]>({
        queryKey: ["resData"], 
        queryFn: () => getResolution(),
        staleTime: 1000 * 60 * 30,
    });
};
