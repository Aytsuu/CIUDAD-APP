import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { resolveCase, escalateCase, forwardCase, reEscalateCase } from "../requestAPI/summonPutAPI";

export const useResolveCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (data: { status_type: string; sc_id: string, staff_id: string}) => resolveCase(data.status_type, data.sc_id, data.staff_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "resolveCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })

            toast.success('Case marked as resolved', {
                id: "resolveCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.", {
            id: "resolveCase",
            duration: 2000
            });
        }
    })
}

export const useForwardcase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (sc_id: string) => forwardCase(sc_id),
        onMutate: () =>{
            toast.loading("Forwarding...", { id: "forwardCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            queryClient.invalidateQueries({ queryKey: ['councilCases'] })

            toast.success('Case is forwarded to Lupon', {
                id: "forwardCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.", {
            id: "resolveCase",
            duration: 2000
            });
        }
    })
}

export const useEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
       mutationFn: ( data: {sc_id: string, comp_id?: string, staff_id: string}) =>escalateCase(data.sc_id, data.comp_id || "", data.staff_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "escalateCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
            queryClient.invalidateQueries({ queryKey: ['summonCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['councilCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            
            toast.success('Case marked as escalated', {
                id: "escalateCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in marking case:", err);
            toast.error("Failed to mark case.", {
            id: "escalateCase",
            duration: 2000
            });
        }
    })
}

export const useReEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ( comp_id: string) => reEscalateCase(comp_id),
        onMutate: () =>{
            toast.loading("Re-escalating case...", { id: "reEscalateCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['luponCaseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['luponCases'] })
            
            toast.success('Case re-escalated successfully', {
                id: "reEscalateCase",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error in re-escalating case:", err);
            toast.error("Failed to re-escalate case.", {
                id: "reEscalateCase",
                duration: 2000
            });
        }
    })
}

