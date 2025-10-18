import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api"; 
import { Alert } from "react-native";

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.put("notification/bulk-update/", {
        notification_ids: [notificationId],
      }),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return old.map((notif: any) =>
          notif.notif_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        );
      });

      return { previousNotifications };
    },
    onError: (error, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      Alert.alert(
        "Error",
        "Failed to mark notification as read. Please try again."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationIds: string[]) =>
      api.put("notification/bulk-update/", {
        notification_ids: notificationIds,
      }),
    onMutate: async (notificationIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      const previousNotifications = queryClient.getQueryData(["notifications"]);

      queryClient.setQueryData(["notifications"], (old: any) => {
        if (!old) return old;
        return old.map((notif: any) =>
          notificationIds.includes(notif.notif_id)
            ? { ...notif, is_read: true }
            : notif
        );
      });

      return { previousNotifications };
    },
    onSuccess: (data, variables) => {
      Alert.alert(
        "Success",
        `Marked ${variables.length} notification${
          variables.length !== 1 ? "s" : ""
        } as read`
      );
    },
    onError: (error, notificationIds, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications"], context.previousNotifications);
      }
      Alert.alert(
        "Error",
        "Failed to mark notifications as read. Please try again."
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};