import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMinutesOfMeeting, createMOMFile, addSuppDoc } from "../restful-API/MOMPostAPI";
import { minutesOfMeetingFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";
import { z } from "zod";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";


export const useInsertMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: z.infer<typeof minutesOfMeetingFormSchema>) => {
        const mom_id = await  insertMinutesOfMeeting(values);

          if (values.meetingFile?.length) {
            await Promise.all(
              values.meetingFile.map(file => 
                createMOMFile({
                  mom_id,
                  file_data: file
                })
              )
            );
          }
          
          if (values.meetingSuppDoc && values.meetingSuppDoc.length > 0) {
                const validFiles = values.meetingSuppDoc.filter(file => 
                  file && (file.uri || file.path) && file.name
                );
                
                if (validFiles.length > 0) {
                  await Promise.all(
                    validFiles.map(file => 
                      addSuppDoc({
                        mom_id,
                        file_data: file
                      }).catch(error => {
                        console.error("Error creating file entry:", error);
                        return null;
                      })
                    )
                  );
                }
              }      
        
    },
    onSuccess: () => {
        Promise.all([
        queryClient.invalidateQueries({ queryKey: ['momRecords'] }),
        queryClient.invalidateQueries({ queryKey: ['momAreasOfFocus'] }),
        queryClient.invalidateQueries({ queryKey: ['momFiles'] }),
        ])
        
        onSuccess?.();
        router.back()
        toast.success('Meeting Minutes Created!')

    },
    onError: (err: Error) => {
      console.error("Error submitting meeting minutes:", err);
      toast.error("Failed to create meeting minutes. Please check the input data and try again.")
    }
  });
};