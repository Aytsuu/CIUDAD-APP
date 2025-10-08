import { z } from "zod";
import { useQuery, useMutation, useQueryClient  } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateWasteReport } from "../request/illegal-dump-put-request";
import { uploadResolvedImage } from "../request/illegal-dump-put-request";
import { updateWasteResReport } from "../request/illegal-dump-put-request";


// =========================================== STAFF =============================
type FileData = {
    name: string;
    type: string;
    file: string;
};


export const useUpdateWasteReport = (rep_id: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();  

  return useMutation({
    mutationFn: async (values: { 
      rep_status: string;
      files?: FileData[] 
    }) => {
      // 1. Update the main report status and date
      await updateWasteReport(rep_id, {
        rep_status: values.rep_status,
      });
      
      // 2. Upload all resolution images in parallel (if any)
      if (values.files && values.files.length > 0) {
        await Promise.all(
          values.files.map(file => 
            uploadResolvedImage({
              rep_id,
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
      
      return rep_id;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wastereport'] });
            
      // Show success toast
      toast.success('Report updated successfully');

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating waste report:", err);
      toast.error(
        "Failed to update report. Please try again.",
      );
    }
  });
};



// =========================================== RESIDENT ========================================

export const useUpdateWasteResReport = (rep_id: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();  

  return useMutation({
    mutationFn: async (values: { 
      rep_status: string;
      rep_cancel_reason: string | undefined;
    }) => {

      await updateWasteResReport(rep_id, {
        rep_status: values.rep_status,
        rep_cancel_reason: values.rep_cancel_reason
      });
      
      return rep_id;
    },  
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wastereport'] });
            
      // Show success toast
      toast.success('Report is cancelled successfully');

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error in cancelling waste report:", err);
      toast.error(
        "Failed to cancel report. Please try again.",
      );
    }
  });
};