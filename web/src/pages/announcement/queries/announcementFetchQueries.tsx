import { useQuery } from "@tanstack/react-query";
import {
  getAnnouncementRequest,
  getAnnouncementRecipientRequest,
} from "../restful-api/announcementGetRequest";

export type Announcement = {
  ann_type: any;
  ann_id?: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: Date | string;
  ann_start_at?: Date | string;
  ann_end_at?: Date | string;
  staff: string;
  files?: {
    af_id: number;
    af_name: string;
    af_type: string;
    af_url: string;
  }[];
};


export type AnnouncementRecipient = {
  position_title: any;
  ar_id: number;
  ar_mode: string;
  ann: number;
  position: string;
  ar_age: string;
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
    staleTime: 1000 * 60 * 5,
  });
};

