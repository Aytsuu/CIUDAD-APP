import { useQueryClient, useMutation } from "@tanstack/react-query";
import z from "zod"
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { archiveHotspot } from "../restful-API/hotspotDeleteAPI";

export const useArchiveHotspot = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (wh_num: string) => archiveHotspot(wh_num),
        onMutate: () =>{
            toast.loading("Deleting schedule ...", { id: "archiveHotspot" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotspots'] })
            toast.success('Request marked as completed', {
                id: "archiveHotspot",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error updating request status:", err);
            toast.error("Failed to update request status", {
            id: "updateGarbageStatus",
            duration: 2000
            });
        }
    })
}