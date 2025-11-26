import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMinutesOfMeeting, createMOMFile, addSuppDoc } from "../restful-API/MOMPostAPI";
import {minutesOfMeetingFormSchema} from "@/form-schema/council/minutesOfMeetingSchema";
import { z } from "zod";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";

type FileData = {
    name: string| undefined;
    type: string | undefined;
    file?: string | undefined;
};

type MOMFullData= z.infer<typeof minutesOfMeetingFormSchema> & {
  files: FileData[]; 
  suppDocs: FileData[]; 
};


export const useInsertMinutesOfMeeting = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
     mutationFn: async (values: MOMFullData) => {
        const mom_id = await  insertMinutesOfMeeting(values);

          if (values.files?.length) {
            await Promise.all(
              values.files.map(file => 
                createMOMFile({
                  mom_id,
                  file_data: {
                    name: file.name,
                    type: file.type,
                    file: file.file
                  }
                })
              )
            );
          }
          
          if (values.suppDocs && values.suppDocs.length > 0) {
                await Promise.all(
                    values.suppDocs.map(file => 
                      addSuppDoc({
                        mom_id,
                        file_data: {
                          name: file.name,
                          type: file.type,
                          file: file.file
                        }
                      }).catch(_error => {
                        // console.error("Error creating file entry:", error);
                        return null;
                      })
                    )
                  );
              }      
        
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ActivemomRecords'] });
        queryClient.invalidateQueries({ queryKey: ['momFiles'] });

      showSuccessToast('Meeting Minutes Created!')
      onSuccess?.();
    },
    onError: () => {
      // console.error("Error submitting meeting minutes:", err);
      showErrorToast(
        "Failed to create meeting minutes. Please check the input data and try again."
      );
    }
  });
};