import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { resolveCase, escalateCase } from "../requestAPI/summonPutAPI";

export const useResolveCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
        mutationFn: (sr_id: string) => resolveCase(sr_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "resolveCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
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

export const useEscalateCase = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

     return useMutation({
       mutationFn: ({ srId, comp_id }: { srId: string, comp_id: string }) =>escalateCase(srId, comp_id),
        onMutate: () =>{
            toast.loading("Marking case...", { id: "escalateCase" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['caseDetails'] })
            queryClient.invalidateQueries({ queryKey: ['summonCases'] })
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