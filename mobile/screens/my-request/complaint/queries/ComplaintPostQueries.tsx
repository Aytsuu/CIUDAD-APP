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