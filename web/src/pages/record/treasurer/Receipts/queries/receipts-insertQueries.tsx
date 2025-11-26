import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addReceipt, addPersonalReceipt } from "../request/receipts-post-request";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import ReceiptSchema from "@/form-schema/receipt-schema";
import {z} from "zod"


export const useAddReceipt = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof ReceiptSchema>) => 
            addReceipt(values),
            onSuccess: () => {
                // Refresh relevant data
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['nonResidentReq'] });
                queryClient.invalidateQueries({ queryKey: ['permitClearances'] });

                // User feedback
                toast.loading('Submitting Record...', {id: "addReceipt"});
                toast.success('Receipt created!', {
                    id: "addReceipt",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 1500
                });

                onSuccess?.();
            },
            onError: (err) => {
                toast.error(
                    `Error submitting Receipt: ${err.message}`,
                    { duration: 2000 }
                );
            }
        })
}

export const useAddPersonalReceipt = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof ReceiptSchema>) => 
            addPersonalReceipt(values),
            onSuccess: () => {
                // Refresh relevant data
                queryClient.invalidateQueries({ queryKey: ['invoices'] });
                queryClient.invalidateQueries({ queryKey: ['nonResidentReq'] });
                queryClient.invalidateQueries({ queryKey: ['permitClearances'] });

                // User feedback
                toast.loading('Submitting Record...', {id: "addReceipt"});
                toast.success('Receipt created!', {
                    id: "addReceipt",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 1500
                });

                onSuccess?.();
            },
            onError: (err) => {
                toast.error(
                    `Error submitting Receipt: ${err.message}`,
                    { duration: 2000 }
                );
            }
        })
}

