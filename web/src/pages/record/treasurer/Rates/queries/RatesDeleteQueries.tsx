import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteAnnualGrossSales, deletePurposeAndRate } from "../restful-API/RatesDeleteAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useDeleteAnnualGrossSales = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (ags_id: number) => deleteAnnualGrossSales(ags_id),
      onSuccess: () => {
            toast.loading("Deleting record...", { id: "deleteGrossSales" });

            toast.success('Record deleted successfully', {
            id: 'deleteGrossSales',
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            duration: 2000
        });

        queryClient.invalidateQueries({ queryKey: ['grossSales'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
        console.error("Error archiving entry:", err);
        toast.error("Failed to archive entry");
        }
    })
}

export const useDeletePurposeAndRate = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (pr_id: number) => deletePurposeAndRate(pr_id),
      onSuccess: () => {
            toast.loading("Deleting record...", { id: "deletePurposeAndRate" });

            toast.success('Record deleted successfully', {
            id: 'deletePurposeAndRate',
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            duration: 2000
        });

        queryClient.invalidateQueries({ queryKey: ['purposeRates'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
        console.error("Error archiving entry:", err);
        toast.error("Failed to archive entry");
        }
    })
}
