import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod"
import { RejectPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { addPickupAssignmentandCollectors, addDecision } from "../restful-api/GarbageRequestPostAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useAddDecision = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof RejectPickupRequestSchema>) => 
            addDecision(values.garb_id, {
                reason: values.reason,
                staff_id: values.staff_id
            }),
            onSuccess: () => {
                Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageRejectedRequest'] })
                ]);
        
                showSuccessToast('Request rejected!')
                onSuccess?.()
            },
            onError: () => {
                toast.error(
                    "Failed to submit record. Please check the input data and try again.",
                    { duration: 2000 }
                );
            }
        })
}

export const useAddPickupAssignmentandCollectors = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: any) => 
            addPickupAssignmentandCollectors(values.garb_id, {
                date: values.date,
                driver: values.driver,
                time: values.time,
                truck: values.truck,
                collectors: values.loaders,
                staff_id: values.staff_id
            }),
        onSuccess: () => {
            Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] })
            ]);
            showSuccessToast('Request Accepted!')
            onSuccess?.();
        },
        onError: () => {
            showErrorToast( "Failed to create pickup assignment. Please check the input data and try again.")
        }
    });
};