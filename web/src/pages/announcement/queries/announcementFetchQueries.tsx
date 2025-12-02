import { useQuery } from "@tanstack/react-query";
import {
  getAnnouncementRequest,
  getAnnouncementRecipientRequest,
  getCreatedReceivedAnnouncements,
} from "../restful-api/announcementGetRequest";
import api from "@/api/api";

// Matches Django Announcement model
export type Announcement = {
  ann_id: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: string; // API will send ISO date string
  ann_start_at?: string | null;
  ann_end_at?: string | null;
  ann_event_start?: string | null;
  ann_event_end?: string | null;
  ann_type: string;
  ann_to_sms?: boolean;
  ann_to_email?: boolean;
  staff?: number | null; // Foreign key: staff_id
  files?: AnnouncementFile[];
};

export type AnnouncementFile = {
  af_id: number;
  ann: number;
  af_name: string;
  af_type: string;
  af_path?: string;
  af_url: string;
};

// Matches Django AnnouncementRecipient model
export type AnnouncementRecipient = {
  ar_id: number;
  ann: number; // Announcement ID
  ar_type?: string | null; // Can be empty
};

export function useGetAnnouncement() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncementRequest,
    staleTime: 5000
  });
}

export function useGetAnnouncementList(
  page: number = 1,
  page_size: number = 10,
  search: string,
  staff: string | null,
  sort: string,
  filter: string,
  recipient: string
) {
  return useQuery({
    queryKey: ["announcements", page, page_size, search, staff, sort, filter, recipient],
    queryFn: async () => {
      try {
        const res = await api.get(`announcement/list/`, {
          params: {
            page,
            page_size,
            search,
            staff,
            sort,
            filter,
            recipient
          },
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 1000 * 60 * 15,
    placeholderData: (previous) => previous,
    retry: false,
  });
}


// Pass ann_id to fetch only its recipients
export function useGetAnnouncementRecipient(ann_id: number) {
  return useQuery({
    queryKey: ["announcementRecipients", ann_id],
    queryFn: () => getAnnouncementRecipientRequest(ann_id),
    enabled: !!ann_id, // only run when we have an id
    staleTime: 5000
  });
}

export function useGetCreatedReceivedAnnouncements(staff_id: string) {
  return useQuery({
    queryKey: ["createdReceivedAnnouncements", staff_id],
    queryFn: () => getCreatedReceivedAnnouncements(staff_id),
    enabled: !!staff_id,
    staleTime: 5000,
  });
}