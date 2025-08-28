import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { acceptReq } from "../restful-api/personalClearancePutAPI";


export const useAcceptRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (cr_id: string) => 
            acceptReq(cr_id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['residentReq'] });
                queryClient.invalidateQueries({ queryKey: ['invoices'] });

        
                toast.success('Request Accepted!', {
                    id: "accept",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error accepting request", err);
                toast.error(
                    "Failed to accept request. Please check the data and try again.",
                    { duration: 2000 }
                );
            }
        })
}