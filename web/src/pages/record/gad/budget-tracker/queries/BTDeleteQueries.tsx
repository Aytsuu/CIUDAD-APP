import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { archiveBudgetEntry, restoreBudgetEntry, permanentDeleteBudgetEntry } from "../requestAPI/BTDelRequest";

export const useArchiveGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: archiveBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry archived successfully", {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (error: Error) => {
            toast.error("Failed to archive entry", {
                description: error.message,
                icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
                duration: 2000
            });
        }
    });
};

export const useRestoreGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: restoreBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry restored successfully", {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (error: Error) => {
            toast.error("Failed to restore entry", {
                description: error.message,
                icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
                duration: 2000
            });
        }
    });
};

export const usePermanentDeleteGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: permanentDeleteBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry permanently deleted", {
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (error: Error) => {
            toast.error("Failed to permanently delete entry", {
                description: error.message,
                icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
                duration: 2000
            });
        }
    });
};