import { z } from "zod";
import { useQuery, useMutation, useQueryClient  } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateWasteReport } from "../request/illegal-dump-put-request";
import { uploadResolvedImage } from "../request/illegal-dump-put-request";

// interface UpdateWasteReportData {
//   rep_status: string;
//   rep_resolved_img?: string;
// }


// export const useUpdateWasteReport = (rep_id: number, onSuccess?: () => void) => {
//   const queryClient = useQueryClient();
//   const {toast} = useToastContext();

//   return useMutation({
//     mutationFn: async (data: UpdateWasteReportData) => {
//         return updateWasteReport(rep_id, data)
//     },
//    onSuccess: () => {

//       toast.success('Waste Report Updated');
      
//       // Invalidate any related queries if needed
//       queryClient.invalidateQueries({ queryKey: ["wastereport"] });
      
//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error updating report:", err);
//       toast.error("Failed to update report");
//     }

//   });
// };




interface UpdateWasteReportData {
  rep_status: string;
  rep_resolved_img?: string;
}

interface ResolvedImage {
    name: string;
    type: string;
    path: string;
    url: string;
}


export const useUpdateWasteReport = (rep_id: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();  

  return useMutation({
    mutationFn: async (values: { 
      rep_status: string;
      rep_resolved_img?: ResolvedImage[] 
    }) => {
      // 1. Update the main report status and date
      await updateWasteReport(rep_id, {
        rep_status: values.rep_status,
      });
      
      console.log("GAWAS SA QUERY: ", values.rep_resolved_img)
      // 2. Upload all resolution images in parallel (if any)
      if (values.rep_resolved_img && values.rep_resolved_img.length > 0) {
        console.log("NISUD SA QUERY: ", values.rep_resolved_img)
        await Promise.all(
          values.rep_resolved_img.map(image => 
            uploadResolvedImage({
              rep_id,
              wrsf_name: image.name,
              wrsf_type: image.type,
              wrsf_path: image.path,
              wrsf_url: image.url
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