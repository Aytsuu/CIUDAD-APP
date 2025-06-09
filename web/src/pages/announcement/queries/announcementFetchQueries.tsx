import { useQuery } from "@tanstack/react-query";
import { getAnnouncementRequest } from "../request-db/announcementGetRequest";

export type Announcement = {
  ann_id: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: Date;
  ann_start_at: Date;
  ann_end_at: Date;
  ann_type: string;
  // staff: number;
};


export const useGetAnnouncement = () => {
  return useQuery<Announcement[], Error>({
    queryKey: ["announcement"],
    queryFn:  () => getAnnouncementRequest().catch((error) => {
        console.error("Error fetching announcements:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};