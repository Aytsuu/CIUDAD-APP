import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { archiveBudgetEntry, restoreBudgetEntry, permanentDeleteBudgetEntry } from "../requestAPI/BTDelRequest";

export const useArchiveGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: archiveBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            showSuccessToast("Entry archived successfully");
        },
        onError: (_error: Error) => {
            showErrorToast("Failed to archive entry");
        }
    });
};

export const useRestoreGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: restoreBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            showSuccessToast("Entry restored successfully");
        },
        onError: (_error: Error) => {
            showErrorToast("Failed to restore entry");
        }
    });
};

export const usePermanentDeleteGADBudget = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: permanentDeleteBudgetEntry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gad-budgets"] });
            showSuccessToast("Entry permanently deleted");
        },
        onError: (_error: Error) => {
            showErrorToast("Failed to permanently delete entry");
        }
    });
};