import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAnnouncement } from "../restful-api/announcementDelRequest";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export type Announcement = {
  ann_id: number;
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ann_id: number) => deleteAnnouncement(String(ann_id)),
    onSuccess: () => {
      // Update cache
      // queryClient.setQueryData(
      //   ["createdReceivedAnnouncements", staffId], 
      //   (old: { created: Announcement[]; received: Announcement[] } | undefined) => {
      //     if (!old) return old;
      //     return {
      //       created: old.created.filter(a => a.ann_id !== ann_id),
      //       received: old.received.filter(a => a.ann_id !== ann_id),
      //     };
      //   }
      // );

      // Refetch just in case
      queryClient.invalidateQueries({
        queryKey: ["announcements"], // ✅ fixed key
      });

      showSuccessToast("Announcement deleted successfully")
    },
    onError: () => {
      showErrorToast("Failed to delete announcement")
    },
  });
};
