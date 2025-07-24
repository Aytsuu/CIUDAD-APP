import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { deleteResolution } from "../request/resolution-delete-request";
import { archiveOrRestoreRes } from "../request/resolution-delete-request";


// Resolution Deletion
export const useDeleteResolution = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (res_num: number) => deleteResolution(res_num),
    onMutate: async (res_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['resData'] });
      
      
      return { res_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      // Show success toast
      toast.success("Resolution deleted");
    },
    onError: (err) => {
      toast.error("Failed to delete resolution");
      console.error("Failed to delete resolution:", err);
    }
  });
};



//Resolution Restore or Archive
interface ArchiveResolutionPayload {
  res_num: number;
  res_is_archive: boolean;
}

export const useArchiveOrRestoreResolution = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (data: ArchiveResolutionPayload) => {
      // Single API call to archive/restore the resolution
      return await archiveOrRestoreRes(data.res_num, { 
        res_is_archive: data.res_is_archive 
      });
    },
    onSuccess: (_, data) => {

      toast.success(data.res_is_archive ? 'Successfully archived resolution' : 'Successfully restored resolution');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      if (onSuccess) onSuccess();
    },
    onError: (err: any, data) => {
        console.error(`Error ${data.res_is_archive ? 'archiving' : 'restoring'} resolution:`, err);
        toast.error(err.message || `Failed to ${data.res_is_archive ? 'archive' : 'restore'} resolution`);
    },
  });
};