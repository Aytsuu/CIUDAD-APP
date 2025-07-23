import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { CircleCheck } from "lucide-react-native";
import { deleteAnnualGrossSales, deletePurposeAndRate } from "../restful-API/ratesDeleteAPI";


export const useDeleteAnnualGrossSales = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext();

    return useMutation({
      mutationFn: (ags_id: number) => deleteAnnualGrossSales(ags_id),
      onSuccess: () => {

        toast.success('Record deleted successfully')

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
    const {toast} = useToastContext();

    return useMutation({
      mutationFn: (pr_id: number) => deletePurposeAndRate(pr_id),
      onSuccess: () => {
         
        toast.success('Record deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['purposeRates'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
        console.error("Error archiving entry:", err);
        toast.error("Failed to archive entry");
        }
    })
}
