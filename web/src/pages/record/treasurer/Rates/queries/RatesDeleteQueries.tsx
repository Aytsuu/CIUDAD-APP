import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAnnualGrossSales, deletePurposeAndRate } from "../restful-API/RatesDeleteAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useDeleteAnnualGrossSales = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (ags_id: number) => deleteAnnualGrossSales(ags_id),
      onSuccess: () => {
        toast.loading("Deleting record...", { id: "deleteGrossSales" });
        showSuccessToast('Record deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['grossSales'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
        console.error("Error archiving entry:", err);
        showErrorToast("Failed to archive entry");
        }
    })
}

export const useDeletePurposeAndRate = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (pr_id: number) => deletePurposeAndRate(pr_id),
      onSuccess: () => {
            toast.loading("Deleting record...", { id: "deletePurposeAndRate" });

            showSuccessToast('Record deleted successfully',)

        queryClient.invalidateQueries({ queryKey: ['purposeRates'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
        console.error("Error archiving entry:", err);
        showErrorToast("Failed to archive entry");
        }
    })
}
