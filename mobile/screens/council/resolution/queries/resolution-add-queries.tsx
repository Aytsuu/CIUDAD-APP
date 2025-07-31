import { useToastContext } from "@/components/ui/toast";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { resolution_create } from "../request/resolution-post-request";
import { resolution_file_create } from "../request/resolution-post-request";
import { resolution_supp_doc_create } from "../request/resolution-post-request";
import resolutionFormSchema from "@/form-schema/council/resolutionFormSchema";




export const useCreateResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (values: z.infer<typeof resolutionFormSchema>) => {
      // 1. Create main resolution
      const res_num = await resolution_create(values);
      
      // 2. Create all file resolution
      if (values.res_file?.length) {
        await Promise.all(
          values.res_file.map(file => 
            resolution_file_create({
              res_num,
              file_data: file
            })
          )
        );
      }

      // 3. Create all supporting documents
      if (values.res_supp_docs && values.res_supp_docs.length > 0) {
        // Filter out any invalid files before processing
        const validFiles = values.res_supp_docs.filter(file => 
          file && (file.uri || file.path) && file.name
        );
        
        if (validFiles.length > 0) {
          await Promise.all(
            validFiles.map(file => 
              resolution_supp_doc_create({
                res_num,
                file_data: file
              }).catch(error => {
                console.error("Error creating file entry:", error);
                // Continue with other files even if one fails
                return null;
              })
            )
          );
        }
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