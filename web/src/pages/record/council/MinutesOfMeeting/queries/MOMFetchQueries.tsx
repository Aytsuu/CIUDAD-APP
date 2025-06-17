import { useQuery } from "@tanstack/react-query";
import { getMinutesOfMeeting } from "../restful-API/MOMGetAPI";

export type MinutesOfMeetingRecords = {
    mom_id: string;
    mom_date: string;
    mom_agenda: string;
    mom_title: string;
    mom_is_archive: boolean;
    file_url: string;
    file_id: string;
    areas_of_focus: string[];
    supporting_docs: string[];
}

export const useGetMinutesOfMeetingRecords = () => {
    return useQuery<MinutesOfMeetingRecords[]>({
        queryKey: ["momRecords"],
        queryFn: getMinutesOfMeeting,
        staleTime: 1000 * 60 * 30, 
    })
}