import { z } from "zod";
import { useQuery, useMutation, useQueryClient  } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { updateWasteReport } from "../request/illegal-dump-put-request";

interface UpdateWasteReportData {
  rep_status: string;
  rep_resolved_img?: string;
}


export const useUpdateWasteReport = (rep_id: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();

  return useMutation({
    mutationFn: async (data: UpdateWasteReportData) => {
        return updateWasteReport(rep_id, data)
    },
   onSuccess: () => {

      toast.success('Waste Report Updated');
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ["wastereport"] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating report:", err);
      toast.error("Failed to update report");
    }

  });
};