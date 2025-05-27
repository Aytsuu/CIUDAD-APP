import { useQuery } from "@tanstack/react-query";
import { getEvent_meetingreq } from "../api/getreq";

export type CouncilEventInfo = {
    ce_id: number,
    ce_title: string,
    ce_date: string,
    ce_place: string,
    ce_type: string,
    ce_time: string,
    ce_description: string,
    staff: string,
}

export const useFetchCouncilEvent = () => {
  return useQuery<CouncilEventInfo[], Error>({
    queryKey: ["councilEvent"],
    queryFn: () => getEvent_meetingreq().catch((error) => {
        console.error("Error fetching schedule entry:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};