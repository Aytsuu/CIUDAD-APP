import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateGarbageRequestStatus } from "../restful-API/GarbageRequestPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useUpdateGarbageRequestStatus = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (garb_id: string) => updateGarbageRequestStatus(garb_id),
    onMutate: () => {
      // Show loading state immediately
      toast.loading("Updating request ...", { id: "updateGarbageStatus" });
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] })
      ]);

      toast.success('Request marked as completed', {
        id: "updateGarbageStatus",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      onSuccess?.();
    },
    onError: (err) => {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status", {
        id: "updateGarbageStatus",
        duration: 2000
      });
    }
  });
};