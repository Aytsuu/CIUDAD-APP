import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import {
  postAnnouncement,
  postAnnouncementRecipient,
  postAnnouncementFile,
} from "./restful-api";

export const useGetAnnouncement = () => {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const response = await api.get("announcement/list/");
      const data = response.data?.data ?? response.data ?? [];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const usePostAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Record<string, any>) => postAnnouncement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (err) => {
      console.error("Error submitting announcement:", err);
    },
  });
};

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

export const usePostAnnouncementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: Record<string, any>[]) => postAnnouncementFile(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement_files"] });
    },
    onError: (err) => {
      console.error("Error uploading files:", err);
    },
  });
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ann_id: string) => {
      const res = await api.delete(`announcement/announcements/${ann_id}/`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};
