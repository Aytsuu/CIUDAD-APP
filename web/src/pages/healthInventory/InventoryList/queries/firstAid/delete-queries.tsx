import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { handleDeleteFirstAidList } from '../../restful-api/firstAid/FirstAidDeleteAPI';

export const useDeleteFirstAid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (firstAidId: string) => handleDeleteFirstAidList(firstAidId),
    
    // Show loading toast with spinner
    onMutate: () => {
      toast.loading("Deleting first aid item...", {
        icon: <Loader2 size={18} className="animate-spin stroke-gray" />,
        id: "delete-loading",
      });
    },

    // On success, dismiss loading and show success
    onSuccess: () => {
      toast.dismiss("delete-loading");
      toast.success("First aid item deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
    
    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message = error?.response?.data?.error || "Failed to delete first aid item";
      toast.error(message, {
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    }
  });
};