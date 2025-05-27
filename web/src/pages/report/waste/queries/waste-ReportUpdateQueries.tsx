import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateWasteReport } from "../request/waste-ReportPutRequest";

interface UpdateWasteReportData {
  rep_status: string;
  rep_resolved_img?: string;
}


export const useUpdateWasteReport = (rep_id: number, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWasteReportData) => {
        return updateWasteReport(rep_id, data)
    },
   onSuccess: () => {
      toast.loading("Updating entry...", { id: "updateWasteReport" });

      toast.success('Waste Report Updated', {
        id: 'updateWasteReport',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });
      
      // Invalidate any related queries if needed
      queryClient.invalidateQueries({ queryKey: ['wastereport'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error updating report:", err);
      toast.error("Failed to update report");
    }

  });
};