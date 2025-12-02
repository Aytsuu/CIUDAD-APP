import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {  Loader2 } from 'lucide-react';
import { handleDeleteFirstAidList } from '../../restful-api/firstAid/FirstAidDeleteAPI';
import { showErrorToast,showSuccessToast } from '@/components/ui/toast';

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
     showSuccessToast("First aid item deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
    },
    
    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message = error?.response?.data?.error || "Failed to delete first aid item";
      showErrorToast(message);
    }
  });
};