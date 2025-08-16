import { useQuery } from "@tanstack/react-query";
import { getMinutesOfMeeting } from "../restful-API/MOMGetAPI";

export type SupportingDoc = {
  momsp_id: number;
  momsp_name: string;
  momsp_type: string;
  momsp_path: string;
  momsp_url: string;
  mom_id: string | null;
};

export type MinutesOfMeetingRecords = {
  mom_id: string;
  mom_date: string;
  mom_agenda: string;
  mom_title: string;
  mom_is_archive: boolean;
  momf_url: string;
  momf_id: string;
  areas_of_focus: string[];
  supporting_docs: SupportingDoc[];
};

export const useGetMinutesOfMeetingRecords = () => {
    return useQuery<MinutesOfMeetingRecords[]>({
        queryKey: ["momRecords"],
        queryFn: getMinutesOfMeeting,
        staleTime: 1000 * 60 * 30, 
    })
}