import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { acceptReq, declineReq, declineNonResReq } from "../restful-api/personalClearancePutAPI";


export const useAcceptRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (cr_id: string) => 
            acceptReq(cr_id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['residentReq'] });

        
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

export const useDeclineRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: {cr_id: string, reason: string}) => 
            declineNonResReq(values.cr_id, values.reason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['residentReq'] });

        
                toast.success('Request Declined!', {
                    id: "decline",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error declining request", err);
                toast.error(
                    "Failed to decline request. Please check the data and try again.",
                    { duration: 2000 }
                );
            }
        })
}

export const useDeclineNonReq = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: {nrc_id: string, reason: string}) => 
            declineReq(values.nrc_id, values.reason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['nonResidentReq'] });

        
                toast.success('Request Declined!', {
                    id: "decline",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error declining request", err);
                toast.error(
                    "Failed to decline request. Please check the data and try again.",
                    { duration: 2000 }
                );
            }
        })
}