import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertMinutesOfMeeting, createMOMFile, addSuppDoc } from "../restful-API/MOMPostAPI";
import { z } from "zod";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { minutesOfMeetingFormSchema } from "@/form-schema/council/minutesOfMeetingSchema";


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
  const {toast} = useToastContext();
  const router = useRouter();

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
                      }).catch(error => {
                        console.error("Error creating file entry:", error);
                        return null;
                      })
                    )
                  );
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