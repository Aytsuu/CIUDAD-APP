import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { addSummonSched } from "../restful-API/summon-relatedPostAPI";

export const useAddSched = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext()
    const router = useRouter()

     return useMutation({
            mutationFn: (data: {sd_id: string, st_id: string, sc_id: string, level: string, type: string}) => 
            addSummonSched(data.sd_id, data.st_id, data.sc_id, data.level, data.type),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['caseTrackingDetails']})
                queryClient.invalidateQueries({ queryKey: ['schedList']})
        
                toast.success('Record Submitted!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                // console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.")
            }
        })
}