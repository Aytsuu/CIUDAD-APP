import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMinutesOfMeeting } from "../restful-API/MOMPostAPI";
import {minutesOfMeetingFormSchema} from "@/form-schema/council/minutesOfMeetingSchema";
import { z } from "zod";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";


export const useInsertMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
        values: z.infer<typeof minutesOfMeetingFormSchema>,
        files: { name: string; type: string; file: string | undefined }[]
    }) => {
        return insertMinutesOfMeeting(data.values, data.files);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['momRecords'] });
        queryClient.invalidateQueries({ queryKey: ['momAreasOfFocus'] });
        queryClient.invalidateQueries({ queryKey: ['momFiles'] });

      showSuccessToast('Meeting Minutes Created!')
      onSuccess?.();
    },
    onError: (err: Error) => {
      console.error("Error submitting meeting minutes:", err);
      showErrorToast( "Failed to create meeting minutes. Please check the input data and try again.");
    }
  });
};