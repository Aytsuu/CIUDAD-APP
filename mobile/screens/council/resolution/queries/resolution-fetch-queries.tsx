import { useQuery } from "@tanstack/react-query";
import { getResolution } from "../request/resolution-get-request";
import { getApprovedProposals } from "../request/resolution-get-request";

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
    resolution_supp: {
        rsd_id: number;
        rsd_url: string;
        rsd_name: string;
    }[];    
    gpr_id: number;
}

export const useResolution = (searchQuery?: string, areaFilter?: string, yearFilter?: string) => {
    return useQuery<ResolutionData[]>({
        queryKey: ["resData", searchQuery, areaFilter, yearFilter], 
        queryFn: () => getResolution(searchQuery, areaFilter, yearFilter),
        staleTime: 1000 * 60 * 30,
    });
};



//Fetch Approved Proposals
export interface ProposalOption {
  id: string;
  name: string;
}

export const useApprovedProposals = () => {
  return useQuery<ProposalOption[]>({
    queryKey: ["gadProposals"],
    queryFn: async () => {
      const response = await getApprovedProposals();
      const items = Array.isArray(response) ? response : response?.data;

      if (!items) return [];

      return items.map((item: any) => ({
        id: item.gpr_id?.toString() || "",
        name: item.project_title || "Untitled Proposal",
      }));
    },
    staleTime: 1000 * 60 * 30,
  });
};