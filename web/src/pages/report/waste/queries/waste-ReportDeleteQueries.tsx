import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteWasteReport } from "../request/waste-ReportDeleteRequest";



export const useDeleteWasteReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rep_id: number) => deleteWasteReport(rep_id),
    onMutate: async (rep_id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wastereport'] });
      
      // Show loading toast
      toast.loading("Deleting report...", { id: "deleteWaste" });
      
      return { rep_id };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wastereport'] });
      
      // Show success toast
      toast.success("Waste Report Deleted", {
        id: "deleteWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to waste report", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to waste report:", err);
    }
  });
};

