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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      console.error("Failed to mark notification as read:", error);
      Alert.alert(
        "Error",
        "Failed to mark notification as read. Please try again."
      );
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      Alert.alert(
        "Success",
        `Marked ${variables.length} notification${
          variables.length !== 1 ? "s" : ""
        } as read`
      );
    },
    onError: (error) => {
      console.error("Failed to mark all notifications as read:", error);
      Alert.alert(
        "Error",
        "Failed to mark notifications as read. Please try again."
      );
    },
  });
};