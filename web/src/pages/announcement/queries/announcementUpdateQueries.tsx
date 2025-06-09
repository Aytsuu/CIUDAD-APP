import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { announcementPutRequest  } from "../request-db/announcementPutRequest";
import { Announcement } from "./announcementFetchQueries";

export const useUpdateAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ann_id, announcementInfo }: { ann_id: number; announcementInfo: Partial<Announcement> }) =>
      announcementPutRequest(ann_id, announcementInfo),

    onSuccess: (updatedData, variables) => {
         // Optimistically update the cache
      queryClient.setQueryData(["announcements"], (old: Announcement[] = []) => 
        old.map(announcement => 
          announcement.ann_id === variables.ann_id ? { ...announcement, ...updatedData } : announcement
        )
      );
      
      // Invalidate the query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["announcements"] });

      toast.success("Announcement updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update announcement", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['announcements'] });

      // Snapshot the previous value
      const previousAnnouncements = queryClient.getQueryData(['announcements']);

      // Optimistically update to the new value
      queryClient.setQueryData(['announcements'], (old: Announcement[] = []) => 
        old.map(announcement => 
          announcement.ann_id === variables.ann_id ? { ...announcement, ...variables.announcementInfo } : announcement
        )
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