
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

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
    mutationFn: async (values: Record<string, any>) => {
      const res = await api.post("announcement/create/", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
};

export const usePostAnnouncementRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: any) => {
      const res = await api.post("announcement/create-recipient/", values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
    },
  });
};

export const usePostAnnouncementFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: any[]) => {
      const res = await api.post("announcement/upload-files/", files);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
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