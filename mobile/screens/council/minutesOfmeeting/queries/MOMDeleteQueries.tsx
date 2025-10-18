import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteMinutesOfMeeting } from "../restful-API/MOMDeleteAPI";
import { useToastContext } from "@/components/ui/toast";

export const useDeleteMinutesofMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()
    const {toast} = useToastContext()

    return useMutation({
        mutationFn: (mom_id: string) => deleteMinutesOfMeeting(mom_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['InactivemomRecords'] });

            toast.success('Record is deleted successfully')
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record")
        }
    })
}