import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/api";
import { useToastContext } from "@/components/ui/toast";

// Archive waste event
export const useArchiveWasteEvent = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();

    return useMutation({
        mutationFn: async (weNum: number) => {
            const response = await api.patch(`waste/waste-event/${weNum}/`, {
                we_is_archive: true
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['activeWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['archivedWasteEvents'] });
            toast.success("Event archived successfully!");
        },
        onError: (error: any) => {
            toast.error("Failed to archive event. Please try again.");
        }
    });
};

// Restore waste event
export const useRestoreWasteEvent = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();

    return useMutation({
        mutationFn: async (weNum: number) => {
            const response = await api.patch(`waste/waste-event/${weNum}/`, {
                we_is_archive: false
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['activeWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['archivedWasteEvents'] });
            toast.success("Event restored successfully!");
        },
        onError: (error: any) => {
            toast.error("Failed to restore event. Please try again.");
        }
    });
};

// Delete waste event permanently
export const useDeleteWasteEvent = () => {
    const queryClient = useQueryClient();
    const { toast } = useToastContext();

    return useMutation({
        mutationFn: async (weNum: number) => {
            const response = await api.delete(`waste/waste-event/${weNum}/`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['activeWasteEvents'] });
            queryClient.invalidateQueries({ queryKey: ['archivedWasteEvents'] });
            toast.success("Event deleted successfully!");
        },
        onError: (error: any) => {
            toast.error("Failed to delete event. Please try again.");
        }
    });
};
