import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { updateGarbageReqStatusResident } from "../restful-API/garbagePickupPutAPI";
import { useToastContext } from "@/components/ui/toast";

export const useUpdateGarbReqStatusResident = (onSuccess?: () => void, isViewDetail?: boolean) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();
  const router = useRouter()

  return useMutation({
    mutationFn: (garb_id: string) => updateGarbageReqStatusResident(garb_id),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbagePickupTasks'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] }),

      ]);

      toast.success('Request marked as completed')
      
      onSuccess?.();
      if(isViewDetail) {
        router.back()
      } 
    },
    onError: (err) => {
      // console.error("Error updating request status:", err);
      toast.error("Failed to update request status")
    }
  });
};
