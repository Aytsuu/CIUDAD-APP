import { useQueryClient, useMutation } from "@tanstack/react-query";
import { resolveCase, escalateCase, forwardCase } from "../requestAPI/summonPutAPI";
import { useToastContext } from "@/components/ui/toast";

export const useResolveCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()

     return useMutation({
        mutationFn: (data: { status_type: string; sc_id: string}) => resolveCase(data.status_type, data.sc_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })

            toast.success('Case marked as resolved')
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.")
        }
    })
}

export const useForwardcase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()

     return useMutation({
        mutationFn: (sc_id: string) => forwardCase(sc_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })

            toast.success('Case is forwarded to Lupon')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.")
        }
    })
}

export const useEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()

     return useMutation({
        mutationFn: ( data: {sc_id: string, comp_id?: string}) =>escalateCase(data.sc_id, data.comp_id || ""),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            
            toast.success('Case marked as escalated')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.")
        }
    })
}

