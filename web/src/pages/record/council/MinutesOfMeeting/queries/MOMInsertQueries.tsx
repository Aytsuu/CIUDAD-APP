import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { insertMinutesOfMeeting } from "../restful-API/MOMPostAPI";
import { CircleCheck } from "lucide-react";
import { MediaUploadType } from "@/components/ui/media-upload";
import minutesOfMeetingFormSchema from "@/form-schema/council/minutesOfMeetingSchema";
import { z } from "zod";

// type MOMSubmissionData = {
//   values: z.infer<typeof minutesOfMeetingFormSchema>;
//   mediaFiles: MediaUploadType;
// };

export const useInsertMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
        values: z.infer<typeof minutesOfMeetingFormSchema>,
        mediaFiles: MediaUploadType
    }) => {
        return insertMinutesOfMeeting(data.values, data.mediaFiles);
    },
    onSuccess: () => {
        toast.loading('Creating Meeting Minutes...', { id: "createMOM" });
        queryClient.invalidateQueries({ queryKey: ['momRecords'] });
        queryClient.invalidateQueries({ queryKey: ['momAreasOfFocus'] });
        queryClient.invalidateQueries({ queryKey: ['momFiles'] });

      toast.success('Meeting Minutes Created!', {
        id: "createMOM",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      onSuccess?.();
    },
    onError: (err: Error) => {
      console.error("Error submitting meeting minutes:", err);
      toast.error(
        "Failed to create meeting minutes. Please check the input data and try again.",
        { 
          id: "createMOM",
          duration: 2000 
        }
      );
    }
  });
};