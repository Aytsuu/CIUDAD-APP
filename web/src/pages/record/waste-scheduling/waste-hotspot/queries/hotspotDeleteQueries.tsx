import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteHotspot } from "../restful-API/hotspotDeleteAPI";

export const useDeleteHotspot = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (wh_num: string) => deleteHotspot(wh_num),
      onSuccess: () => {
            toast.loading("Deleting schedule...", { id: "deleteHotspot" });

            toast.success('Schedule deleted successfully', {
            id: 'deleteHotspot',
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            duration: 2000
        });

        queryClient.invalidateQueries({ queryKey: ['hotspots'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
            console.error("Error archiving schedule:", err);
            toast.error("Failed to archive schedule", {
                id: "archiveHotspot",
                duration: 2000
            });
        }
    })
}



