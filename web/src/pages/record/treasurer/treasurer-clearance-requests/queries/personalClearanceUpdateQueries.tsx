import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { acceptReq, declineReq, declineNonResReq, acceptNonResReq } from "../restful-api/personalClearancePutAPI";


export const useAcceptRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (cr_id: string) => 
            acceptReq(cr_id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['residentReq'] });

        
                showSuccessToast('Request Accepted!');
                onSuccess?.()
            },
            onError: (err) => {
                showErrorToast("Failed to accept request. Please check the data and try again.");
            }
        })
}

export const useDeclineRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: {cr_id: string, reason: string}) => 
            declineReq(values.cr_id, values.reason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['residentReq'] });

        
                showSuccessToast('Request Declined!');
                onSuccess?.()
            },
            onError: (err) => {
                showErrorToast("Failed to decline request. Please check the data and try again.");
            }
        })
}

export const useAcceptNonResRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: {nrc_id: string, discountReason?: string}) => 
            acceptNonResReq(values.nrc_id, values.discountReason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['nonResidentReq'] });

        
                showSuccessToast('Request Accepted!');
                onSuccess?.()
            },
            onError: (err) => {
                showErrorToast("Failed to accept request. Please check the data and try again.");
            }
        })
}

export const useDeclineNonReq = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: {nrc_id: string, reason: string}) => 
            declineNonResReq(values.nrc_id, values.reason),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['nonResidentReq'] });

        
                showSuccessToast('Request Declined!');
                onSuccess?.()
            },
            onError: (err) => {
                showErrorToast("Failed to decline request. Please check the data and try again.");
            }
        })
}