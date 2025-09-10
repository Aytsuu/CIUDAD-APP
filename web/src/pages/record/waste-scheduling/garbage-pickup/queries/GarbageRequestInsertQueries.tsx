import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod"
import { RejectPickupRequestSchema, AcceptPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { addPickupAssignmentandCollectors, addDecision } from "../restful-api/GarbageRequestPostAPI";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useAddDecision = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof RejectPickupRequestSchema>) => 
            addDecision(values.garb_id, {
                reason: values.reason
            }),
            onSuccess: () => {
                Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageRejectedRequest'] })
                ]);
        
                showSuccessToast('Request rejected!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
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
        mutationFn: (values: z.infer<typeof AcceptPickupRequestSchema>) => 
            addPickupAssignmentandCollectors(values.garb_id, {
                date: values.date,
                driver: values.driver,
                time: values.time,
                truck: values.truck,
                collectors: values.collectors
            }),
        onSuccess: () => {
            Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] })
            ]);
            showSuccessToast('Request Accepted!')
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error creating pickup assignment:", err);
            showErrorToast( "Failed to create pickup assignment. Please check the input data and try again.")
        }
    });
};