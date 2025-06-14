import { useQuery } from "@tanstack/react-query";
import {
  getAnnouncementRequest,
  getAnnouncementRecipientRequest,
} from "../restful-api/announcementGetRequest";

export type Announcement = {
  ann_id?: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: Date | string;
  ann_start_at: Date | string;
  ann_end_at: Date | string;
  ann_type: string;
  staff: string;
};

export type AnnouncementRecipient = {
  ar_id: number;
  ar_type: string;
  ar_mode: string;
  ann: number;
};

export const useGetAnnouncement = () => {
  return useQuery<Announcement[], Error>({
    queryKey: ["announcements"],
    queryFn: getAnnouncementRequest,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAnnouncementRecipient = () => {
  return useQuery<AnnouncementRecipient[], Error>({
    queryKey: ["recipients"],
    queryFn: getAnnouncementRecipientRequest,
  });
};
