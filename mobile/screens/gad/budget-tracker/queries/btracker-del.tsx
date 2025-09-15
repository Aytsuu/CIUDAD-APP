import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { archiveBudgetEntry, restoreBudgetEntry, permanentDeleteBudgetEntry } from "../request/btracker-delete";

export const useArchiveGADBudget = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext()

    return useMutation({
        mutationFn: archiveBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry archived successfully")
        },
        onError: (error: Error) => {
            toast.error("Failed to archive entry")
        }
    });
};

export const useRestoreGADBudget = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext()

    return useMutation({
        mutationFn: restoreBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry restored successfully")
        },
        onError: (error: Error) => {
            toast.error("Failed to restore entry")
        }
    });
};

export const usePermanentDeleteGADBudget = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext()
    
    return useMutation({
        mutationFn: permanentDeleteBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            toast.success("Entry permanently deleted")
        },
        onError: (error: Error) => {
            toast.error("Failed to permanently delete entry")
        }
    });
};