import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateGarbageRequestStatus, updateAssignmentCollectorsAndSchedule } from "../restful-API/garbagePickupStaffPutAPI";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";

export const useUpdateGarbageRequestStatus = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();
  const router = useRouter()

  return useMutation({
    mutationFn: (garb_id: string) => updateGarbageRequestStatus(garb_id),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] })
      ]);

      toast.success('Request marked as completed')
      
      onSuccess?.();
      router.back()
    },
    onError: (err) => {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status")
    }
  });
};


export const useUpdateAssignmentCollectorsAndSchedule = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {toast} = useToastContext();
  const router = useRouter()
  
  return useMutation({
    mutationFn: ({pick_id, acl_ids, values
    }: {pick_id: string; acl_ids: string[];
      values: {
        driver: string;
        truck: string;
        date: string;
        time: string;
        collectors: string[];
      };
    }) => updateAssignmentCollectorsAndSchedule(pick_id, acl_ids, values),
    
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),

      toast.success('Assignment updated successfully')
      
      onSuccess?.();
      router.back()
    },
    
    onError: (err) => {
      console.error("Error updating assignment:", err);
      toast.error("Failed to update assignment")
    }
  });
};
