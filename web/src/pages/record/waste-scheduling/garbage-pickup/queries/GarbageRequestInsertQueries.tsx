import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addDecision } from "../restful-API/GarbageRequestPostAPI";
import { CircleCheck } from "lucide-react";
import z from "zod"
import { RejectPickupRequestSchema } from "@/form-schema/garbage-pickup-schema";

export const useAddDecision = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof RejectPickupRequestSchema>) => 
            addDecision(values.garb_id, {
                reason: values.reason
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['rejectGarbageRequest'] });

                toast.loading('Submitting....', {id: "rejectGarbageRequest"});
        
                toast.success('Record Submitted!', {
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