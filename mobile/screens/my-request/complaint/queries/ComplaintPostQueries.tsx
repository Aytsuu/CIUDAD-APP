import api from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRaiseComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async(compId: number) => {
            const res = await api.post( `/complaint/${compId}/raiseissue/`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["complaints"]});
        },
        onError: (error) => {
            console.error("Failed to raise complaintL ", error);
        }
    })
}

interface CancelComplaintData {
    comp_status?: string;
    comp_cancel_reason?: string;
    comp_is_archived?: boolean;
}

export const useCancelComplaint = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async({ compId, cancellationReason }: { compId: number; cancellationReason: string }) => {
            const updateData: CancelComplaintData = {
                comp_status: "Cancelled",
                comp_cancel_reason: cancellationReason,
                comp_is_archived: false // Or true if you want to archive immediately upon cancellation
            };
            
            const res = await api.patch(`/complaint/${compId}/update/`, updateData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ResidentComplaintList"] });
            queryClient.invalidateQueries({ queryKey: ["complaints"] });
        },
        onError: (error) => {
            console.error("Failed to cancel complaint: ", error);
        }
    })
}