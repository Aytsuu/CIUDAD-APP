import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteMinutesOfMeeting } from "../restful-API/MOMDeleteAPI";
import { toast } from "sonner";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useDeleteMinutesofMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mom_id: string) => deleteMinutesOfMeeting(mom_id),
        onMutate: () =>{
            toast.loading("Deleting record ...", { id: "deleteMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            showSuccessToast("Record deleted successfully");
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error deleting record:", err);
            showErrorToast("Failed to delete record");
        }
    })
}