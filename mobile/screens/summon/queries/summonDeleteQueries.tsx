import { deleteSummonTime } from "../requestAPI/summonDeleteAPI";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";


export const useDeleteSummonTime = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()

    return useMutation({
        mutationFn: (st_id: number) => deleteSummonTime(st_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['summonTimeSlots'] });

            toast.success('Time slot is deleted successfully')
            onSuccess?.();
        },
        onError: (err) => {
            // console.error("Error deleting time slot:", err);
            toast.error("Failed to delete time slot")
        }
    })
}