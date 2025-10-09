import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

import {
  postAnnouncement,
  postAnnouncementRecipient,
  postAnnouncementFile,
} from "../restful-api/announcementPostRequest";

export const usePostAnnouncement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: Record<string, any>) => postAnnouncement(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });

      toast.loading("Submitting Record...", { id: "addAnnouncement" });

      toast.success("Record Submitted!", {
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
    mutationFn: (values: any) => postAnnouncementRecipient(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement_recipients"] });
    },
    onError: (err) => {
      console.error("Error submitting recipient:", err);
      toast.error("Failed to submit recipient.", { duration: 2000 });
    },
  });
};

export const usePostAnnouncementFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: Record<string, any>[]) => postAnnouncementFile(files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcement_files"] });

      toast.loading("Uploading Files...", { id: "uploadAnnouncementFiles" });

      toast.success("Files Uploaded!", {
        id: "uploadAnnouncementFiles",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (err) => {
      console.error("Error uploading files:", err);
      toast.error("Failed to upload files.", { duration: 2000 });
    },
  });
};
