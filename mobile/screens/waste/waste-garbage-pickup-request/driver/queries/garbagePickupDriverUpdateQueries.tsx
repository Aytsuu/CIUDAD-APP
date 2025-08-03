import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { updateGarbageRequestStatus } from "../restful-API/garbagePickupStaffPutAPI";
import { useToastContext } from "@/components/ui/toast";

export const useUpdateGarbageRequestStatus = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();
  const router = useRouter()

  return useMutation({
    mutationFn: (garb_id: string) => updateGarbageRequestStatus(garb_id),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbagePickupTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] }),

      ]);

      toast.success('Request marked as completed')
      
      onSuccess?.();
    //   router.back()
    },
    onError: (err) => {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status")
    }
  });
};
