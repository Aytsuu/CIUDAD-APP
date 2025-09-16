import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { handleDeleteCommodityList } from '../../restful-api/commodity/delete-api';

export const useDeleteCommodity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commodityId: string) => handleDeleteCommodityList(commodityId),
    
    // Show loading toast with spinner
    onMutate: () => {
      toast.loading("Deleting commodity....", {
        icon: <Loader2 size={18} className="animate-spin stroke-gray" />,
        id: "delete-loading",
      });
    },

    // On success, dismiss loading and show success
    onSuccess: () => {
      toast.dismiss("delete-loading");
      toast.success("Commodity deleted successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
      });
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    },
    
    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message = error?.response?.data?.error || "Failed to delete commodity";
      toast.error(message, {
        icon: <CircleX size={18} className="fill-red-500 stroke-white" />,
      });
    }
  });
};