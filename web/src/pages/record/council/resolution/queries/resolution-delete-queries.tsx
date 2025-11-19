import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteResolution } from "../request/resolution-delete-request";
import { archiveOrRestoreRes } from "../request/resolution-delete-request";


// Resolution Deletion
export const useDeleteResolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ res_num, staffId }: { res_num: string; staffId?: string }) => deleteResolution(res_num, staffId),
    onMutate: async ({ res_num }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['resData'] });
      
      // Show loading toast
      toast.loading("Deleting resolution...", { id: "deleteRes" });
      
      return { res_num };
    },
    onSuccess: () => {
      // Invalidate and refetch resolution
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      // Invalidate annual dev plans
      queryClient.invalidateQueries({ queryKey: ['annualDevPlans'] });
      
      // Show success toast
      toast.success("Resolution deleted", {
        id: "deleteRes",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete resolution", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete resolution:", err);
    }
  });
};



//Resolution Restore or Archive
interface ArchiveResolutionPayload {
  res_num: string;
  res_is_archive: boolean;
  staffId?: string;
}

export const useArchiveOrRestoreResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArchiveResolutionPayload) => {
      // Single API call to archive/restore the resolution
      return await archiveOrRestoreRes(data.res_num, { 
        res_is_archive: data.res_is_archive,
        staff_id: data.staffId
      });
    },
    onSuccess: (_, data) => {
      toast.loading(data.res_is_archive ? 'Archiving resolution...' : 'Restoring resolution...', { 
        id: 'updateResolution' 
      });

      toast.success(data.res_is_archive ? 'Successfully archived resolution' : 'Successfully restored resolution', {
        id: 'updateResolution',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      // Invalidate annual dev plans
      queryClient.invalidateQueries({ queryKey: ['annualDevPlans'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err: any, data) => {
        console.error(`Error ${data.res_is_archive ? 'archiving' : 'restoring'} resolution:`, err);
        toast.error(err.message || `Failed to ${data.res_is_archive ? 'archive' : 'restore'} resolution`);
    },
  });
};