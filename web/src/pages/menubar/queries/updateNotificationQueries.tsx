import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateBulkNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      api.put("notification/bulk-update/", { 
        notification_ids: notificationIds, 
        is_read: true 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.put("notification/bulk-update/", { 
        notification_ids: [notificationId], 
        is_read: true 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
