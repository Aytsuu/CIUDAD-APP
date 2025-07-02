import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { archiveHotspot, deleteHotspot } from "../restful-API/hotspotDeleteAPI";

export const useArchiveHotspot = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (wh_num: string) => archiveHotspot(wh_num),
        onMutate: () =>{
            toast.loading("Deleting schedule ...", { id: "archiveHotspot" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotspots'] })
            toast.success('Schedule is archived successfully', {
                id: "archiveHotspot",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
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

// export const useRestoreHotspot = (onSuccess?: () => void) => {
//     const queryClient = useQueryClient()

//     return useMutation({
//         mutationFn: (wh_num: string) => restoreHotspot(wh_num),
//         onMutate: () =>{
//             toast.loading("Restoring schedule ...", { id: "restoreHotspot" });
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['hotspots'] })
//             toast.success('Schedule is restored successfully', {
//                 id: "restoreHotspot",
//                 icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                 duration: 2000
//             });
            
//             onSuccess?.();
//         },
//         onError: (err) => {
//             console.error("Error restoring schedule:", err);
//             toast.error("Failed to restore schedule", {
//                 id: "restoreHotspot",
//                 duration: 2000
//             });
//         }
//     })
// }

