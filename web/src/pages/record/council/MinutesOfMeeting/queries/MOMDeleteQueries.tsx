import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteMinutesOfMeeting } from "../restful-API/MOMDeleteAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useDeleteMinutesofMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mom_id: string) => deleteMinutesOfMeeting(mom_id),
        onMutate: () =>{
            toast.loading("Deleting record ...", { id: "deleteMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Record is deleted successfully', {
                id: "deleteMOM",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error deleting record:", err);
            toast.error("Failed to delete record", {
            id: "deleteMOM",
            duration: 2000
            });
        }
    })
}