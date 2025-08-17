import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateGarbageRequestStatus, updateAssignmentCollectorsAndSchedule } from "../restful-api/GarbageRequestPutAPI";
import { toast } from "sonner";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useUpdateGarbageRequestStatus = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (garb_id: string) => updateGarbageRequestStatus(garb_id),
    onMutate: () => {
      toast.loading("Updating request ...", { id: "updateGarbageStatus" });
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['garbageCompletedRequest'] })
      ]);

      showSuccessToast('Request marked as completed')
      onSuccess?.();
    },
    onError: (err) => {
      console.error("Error updating request status:", err);
      showErrorToast("Failed to update request status")
    }
  });
};


export const useUpdateAssignmentCollectorsAndSchedule = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({pick_id,acl_ids,values
    }: {pick_id: string;acl_ids: string[];
      values: {
        driver: string;
        truck: string;
        date: string;
        time: string;
        collectors: string[];
      };
    }) => updateAssignmentCollectorsAndSchedule(pick_id, acl_ids, values),
    
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),

      ]);

      showSuccessToast('Assignment updated successfully');
      onSuccess?.();
    },
    
    onError: (err) => {
      console.error("Error updating assignment:", err);
      showErrorToast("Failed to update assignment");
    }
  });
};
