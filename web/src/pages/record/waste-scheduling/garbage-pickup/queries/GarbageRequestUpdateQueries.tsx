import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateGarbageRequestStatus, updateAssignmentCollectorsAndSchedule } from "../restful-api/GarbageRequestPutAPI";
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
    onSuccess: () => {
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
      // console.error("Error updating request status:", err);
      toast.error("Failed to update request status", {
        id: "updateGarbageStatus",
        duration: 2000
      });
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
    
    onMutate: () => {
      toast.loading("Updating assignment details...", { 
        id: "updateAssignment" 
      });
    },
    
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] }),
        queryClient.invalidateQueries({ queryKey: ['assignmentDetails'] }),

      ]);

      toast.success('Assignment updated successfully', {
        id: "updateAssignment",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      
      onSuccess?.();
    },
    
    onError: () => {
      // console.error("Error updating assignment:", err);
      toast.error("Failed to update assignment", {
        id: "updateAssignment",
        duration: 2000
      });
    }
  });
};
