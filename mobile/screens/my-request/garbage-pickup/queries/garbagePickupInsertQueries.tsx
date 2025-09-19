import { useQueryClient, useMutation } from "@tanstack/react-query";
import { cancelGarbageRequest } from "../restful-API/garbagePickupPostAPI";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";

export const useCancelRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (values: {garb_id: string, reason: string}) => 
            cancelGarbageRequest(values),
            onSuccess: () => {
                Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageCancelledRequest'] })
                ]);


                toast.success('Request cancelled!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error( "Failed to submit record. Please check the input data and try again.",)
            }
        })
}