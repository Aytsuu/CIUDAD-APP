import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteAnnouncement } from "../restful-api/announcementDelRequest";

export type Announcement = {
  ann_id: number;
  ann_title: string;
  ann_details: string;
  ann_created_at: Date | string;
  ann_start_at: Date | string;
  ann_end_at: Date | string;
  staff?: string;
  ar_type: string;
  ar_mode: string;
  rp_id: string;
};

export const useDeleteAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ann_id: number) => deleteAnnouncement(String(ann_id)),
    onSuccess: (_, ann_id) => {
      // Optimistically update the cache
      queryClient.setQueryData(["announcements"], (old: Announcement[] = []) => 
        old.filter(announcement => announcement.ann_id !== ann_id)
      );
      
      // Invalidate the query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["announcements"] });

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
    onMutate: async (ann_id) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['announcements'] });

      // Snapshot the previous value
      const previousAnnouncements = queryClient.getQueryData(['announcements']);

      // Optimistically update to the new value
      queryClient.setQueryData(['announcements'], (old: Announcement[] = []) => 
        old.filter(announcement => announcement.ann_id !== ann_id)
      );

      // Return a context with the previous value
      return { previousAnnouncements };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  });
};