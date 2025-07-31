import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import z from "zod"
import { RejectPickupRequestSchema, AcceptPickupRequestSchema } from "@/form-schema/waste/garbage-pickup-schema-staff";
import { addPickupAssignmentandCollectors, addDecision } from "../restful-API/garbagePickupStaffPostAPI";
import { useRouter } from "expo-router";


export const useAddDecision = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

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

        
                toast.success('Request rejected!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error( "Failed to submit record. Please check the input data and try again.",)
            }
        })
}

export const useAddPickupAssignmentandCollectors = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext();
    const router = useRouter();

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
            toast.success('Request Accepted!')
            onSuccess?.();
            router.back()
        },
        onError: (err) => {
            console.error("Error creating pickup assignment:", err);
            toast.error("Failed to create pickup assignment. Please check the input data and try again.")
        }
    });
};