import { useToastContext } from "@/components/ui/toast";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { resolution_create } from "../request/resolution-post-request";
import { resolution_file_create } from "../request/resolution-post-request";
import { resolution_supp_doc_create } from "../request/resolution-post-request";
import resolutionFormSchema from "@/form-schema/council/resolutionFormSchema";

type FileData = {
    name: string;
    type: string;
    file?: string;
};

type ExtendedResolution= z.infer<typeof resolutionFormSchema> & {
  resFiles: FileData[]; 
  resSuppDocs: FileData[]; 
  staff_id: string;
};


export const useCreateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: ExtendedResolution) => {
      // 1. Create main resolution
      const res_num = await resolution_create(values);
      
      // 2. Create all file resolution
      if (values.resFiles && values.resFiles.length > 0) {
        await Promise.all(
          values.resFiles.map(file => 
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

      // 3. Create all supporting documents 
      if (values.resSuppDocs && values.resSuppDocs.length > 0) {
        await Promise.all(
          values.resSuppDocs.map(file => 
            resolution_supp_doc_create({
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
      toast.success('Resolution created successfully');

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error submitting Resolution:", err);
      toast.error("Failed to submit Resolution. Please check the input data and try again.");
    }
  });
};