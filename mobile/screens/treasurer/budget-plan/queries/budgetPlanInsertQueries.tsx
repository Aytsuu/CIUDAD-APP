import { addBudgetPlanSuppDoc } from "../restful-API/budgetPlanPostAPI"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";

export const useAddBudgetPlanSuppDoc = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext();
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: {
            plan_id: number;
            file: { name: string | undefined; type: string | undefined; file: string | undefined}[];
            description: string;
        }) => {
            return addBudgetPlanSuppDoc(data.plan_id, data.file, data.description);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlanFiles'] });
            
            toast.success('Documents uploaded successfully!')
            onSuccess?.();
            router.back();
        },
        onError: (err: Error) => {
            console.error("Upload error:", err);
            toast.error(err.message || "Failed to upload documents. Please try again.");
        }
    });
};