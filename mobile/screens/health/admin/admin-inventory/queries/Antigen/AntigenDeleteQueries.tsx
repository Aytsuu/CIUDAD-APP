import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { handleDeleteAntigen } from '../../restful-api/Antigen/AntigenDeleteAPI';

export const useDeleteAntigen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vaccineId, category }: { vaccineId: number; category: string }) =>
      handleDeleteAntigen(vaccineId, category),

    // Show loading toast with RED spinner
    onMutate: () => {
      toast.loading("Deleting Antigen....", {
        icon: <Loader2 size={18} className="animate-spin stroke-gray" />, // Red spinner
        id: "delete-loading",
      });
    },

    // On success, dismiss loading and show success
    onSuccess: () => {
      toast.dismiss("delete-loading");
      toast.success("Vaccine deleted successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
      });
      queryClient.invalidateQueries({ queryKey: ["antigen"] });
    },

    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message = error?.response?.data?.error || "Failed to delete vaccine";
      toast.error(message, {
        icon: <CircleX size={18} className="fill-red-500 stroke-white" />,
      });
    },
  });
};