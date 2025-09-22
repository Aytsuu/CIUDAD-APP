import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteAnnouncement } from "../restful-api/announcementDelRequest";

export type Announcement = {
  ann_id: number;
};

export const useDeleteAnnouncement = (staffId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ann_id: number) => deleteAnnouncement(String(ann_id)),
    onSuccess: (_, ann_id) => {
      // Update cache
      queryClient.setQueryData(
        ["createdReceivedAnnouncements", staffId], 
        (old: { created: Announcement[]; received: Announcement[] } | undefined) => {
          if (!old) return old;
          return {
            created: old.created.filter(a => a.ann_id !== ann_id),
            received: old.received.filter(a => a.ann_id !== ann_id),
          };
        }
      );

      // Refetch just in case
      queryClient.invalidateQueries({
        queryKey: ["createdReceivedAnnouncements", staffId], // ✅ fixed key
      });

      toast.success("Announcement deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete announcement", {
        description: error.message,
        duration: 2000
      });
    },
  });
};
