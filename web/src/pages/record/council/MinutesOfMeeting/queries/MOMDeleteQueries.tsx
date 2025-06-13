import { useQueryClient, useMutation } from "@tanstack/react-query";
import { archiveMinutesOfMeeting } from "../restful-API/MOMDeleteAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useArchiveMinutesOfMeeting = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mom_id: string) => archiveMinutesOfMeeting(mom_id),
        onMutate: () =>{
            toast.loading("Deleting record ...", { id: "archiveMOM" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['momRecords'] });

            toast.success('Schedule is archived successfully', {
                id: "archiveMOM",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error archiving record:", err);
            toast.error("Failed to archive record", {
            id: "archiveMOM",
            duration: 2000
            });
        }
    })
}