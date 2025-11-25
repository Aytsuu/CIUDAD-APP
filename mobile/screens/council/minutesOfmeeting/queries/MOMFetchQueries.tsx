import { useQuery } from "@tanstack/react-query";
import { getActiveMinutesOfMeeting, getInactiveMinutesOfMeeting, getMinutesOfMeetingDetails } from "../restful-API/MOMGetAPI";

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
  mom_file: {
    momf_id: string;
    momf_url: string;
    momf_name: string;
  }
  mom_area_of_focus: string[];
  supporting_docs: SupportingDoc[];
};

export const useGetActiveMinutesOfMeetingRecords = (page: number, pageSize: number, searchQuery: string,) => {
    return useQuery<{results: MinutesOfMeetingRecords[], count: number}>({
        queryKey: ["ActivemomRecords", page, pageSize, searchQuery],
        queryFn:() => getActiveMinutesOfMeeting(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    })
}


export const useGetInactiveMinutesOfMeetingRecords = (page: number, pageSize: number, searchQuery: string,) => {
    return useQuery<{results: MinutesOfMeetingRecords[], count: number}>({
        queryKey: ["InactivemomRecords", page, pageSize, searchQuery],
        queryFn:() => getInactiveMinutesOfMeeting(page, pageSize, searchQuery),
        staleTime: 1000 * 60 * 30, 
    })
}

export const useGetMinutesOfMeetingDetails = (mom_id: string) => {
   return useQuery<MinutesOfMeetingRecords>({
        queryKey: ["momRecords", mom_id],
        queryFn: () => getMinutesOfMeetingDetails(mom_id),
        staleTime: 1000 * 60 * 30, 
  })
}