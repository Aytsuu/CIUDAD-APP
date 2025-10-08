import { z } from "zod";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolution_create } from "../request/resolution-post-request";
import { resolution_file_create } from "../request/resolution-post-request";
import resolutionFormSchema from '@/form-schema/council/resolutionFormSchema.ts';


type FileData = {
    name: string;
    type: string;
    file?: string;
};

type ExtendedResolution= z.infer<typeof resolutionFormSchema> & {
  files: FileData[]; 
  staff: string;
};


export const useCreateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (values: ExtendedResolution) => {
      // 1. Create main resolution
      const res_num = await resolution_create(values);
      
      // 2. Create all file resolutin in parallel
      if (values.files && values.files.length > 0) {
        await Promise.all(
          values.files.map(file => 
            resolution_file_create({
              res_num,
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
      
      return res_num;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['resData'] });
     
      // Show success toast
      showSuccessToast('Resolution created successfully')

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting Resolution:", err);
      showErrorToast(
        "Failed to submit Resolution. Please check the input data and try again."
      );      
    }
  });
};