import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDecision } from "../restful-API/GarbageRequestPostAPI";
import { CircleCheck } from "lucide-react";
import z from "zod"
import { RejectPickupRequestSchema, AcceptPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";
import { addPickupAssignmentandCollectors } from "../restful-API/GarbageRequestPostAPI";

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

                toast.loading('Rejecting Request....', {id: "rejectGarbageRequest"});
        
                toast.success('Request rejected!', {
                    id: "rejectGarbageRequest",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
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
        onMutate: () => {
            toast.loading('Creating pickup assignment...', { id: "createPickupAssignment" });
        },
        onSuccess: () => {
            Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['garbageRequest'] }),
                    queryClient.invalidateQueries({ queryKey: ['garbageAcceptedRequest'] })
            ]);
            toast.success('Request Accepted!', {
                id: "createPickupAssignment",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error creating pickup assignment:", err);
            toast.error(
                "Failed to create pickup assignment. Please check the input data and try again.",
                { 
                    id: "createPickupAssignment",
                    duration: 2000 
                }
            );
        }
    });
};