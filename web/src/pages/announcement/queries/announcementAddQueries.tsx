import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { z } from "zod";
import { postAnnouncement, postAnnouncementRecipient } from "../restful-api/announcementPostRequest";
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";

export const usePostAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: z.infer<typeof AnnouncementSchema>) =>
      postAnnouncement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.loading('Submitting Record...', { id: "addAnnouncement" });

      toast.success('Record Submitted!', {
        id: "addAnnouncement",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (err) => {
      console.error("Error submitting announcement:", err);
      toast.error("Failed to submit announcement.", { duration: 2000 });
    },
  });
};

export const usePostAnnouncementRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: any) =>
      postAnnouncementRecipient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcement_recipients'] });
    },
    onError: (err) => {
      console.error("Error submitting recipient:", err);
      toast.error("Failed to submit recipient.", { duration: 2000 });
    },
  });
};
