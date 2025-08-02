import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateWasteReport } from "../request/waste-ReportPutRequest";
import { uploadResolvedImage } from "../request/waste-ReportPutRequest";

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
      
      toast.loading("Updating report...", { id: "updateWasteReport" });
      
      // Show success toast
      toast.success('Report updated successfully', {
        id: "updateWasteReport",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating waste report:", err);
      toast.error(
        "Failed to update report. Please try again.",
        { duration: 2000 }
      );
    }
  });
};