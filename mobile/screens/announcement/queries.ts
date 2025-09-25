import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAnnouncementRequest,
  getAnnouncementRecipientRequest,
  postAnnouncement,
  postAnnouncementRecipient,
  postAnnouncementFile,
  deleteAnnouncement,
} from "./restful-api";

// Fetch all announcements
export const useGetAnnouncement = () => {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: getAnnouncementRequest,
    staleTime: 1000 * 60 * 5,
  });
};

// Fetch recipients for a given announcement
export const useGetAnnouncementRecipient = (ann_id: number) => {
  return useQuery({
    queryKey: ["announcementRecipients", ann_id],
    queryFn: () => getAnnouncementRecipientRequest(ann_id),
    enabled: !!ann_id,
    staleTime: 5000,
  });
};

// Create new announcement
export const usePostAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Record<string, any>) => postAnnouncement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err: any) => {
      console.error("Error submitting announcement:", err.response?.data || err.message);
    },
  });
};

// Add recipients (bulk)
export const usePostAnnouncementRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) => postAnnouncementRecipient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement_recipients"] });
    },
    onError: (err) => {
      console.error("Error submitting recipient:", err);
    },
  });
};

// Upload files
export const usePostAnnouncementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: Record<string, any>[]) => postAnnouncementFile(files),
    onSuccess: (_, variables) => {
      if (variables.length && (variables[0].ann || variables[0].ann_id)) {
        queryClient.invalidateQueries({
          queryKey: ["announcementFiles", variables[0].ann || variables[0].ann_id],
        });
      }
    },
    onError: (err: any) => {
      console.error("Error uploading files:", err.response?.data || err.message);
    },
  });
};

// Delete announcement
export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ann_id: string) => deleteAnnouncement(ann_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err: any) => {
      console.error("Error deleting announcement:", err.response?.data || err.message);
    },
  });
};
