import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { handleDeleteAntigen } from "../../restful-api/Antigen/deleteAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useDeleteAntigen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vaccineId, category }: { vaccineId: number; category: string }) => handleDeleteAntigen(vaccineId, category),

    // On success, dismiss loading and show success
    onSuccess: () => {
      showSuccessToast("Vaccine deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["ImzSupplies"] });
      queryClient.invalidateQueries({ queryKey: ["VaccineListCombine"] });
    },

    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message = error?.response?.data?.error || "Failed to delete vaccine";
      showErrorToast(message);
    }
  });
};
