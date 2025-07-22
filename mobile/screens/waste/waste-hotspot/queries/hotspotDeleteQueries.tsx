import { useQueryClient, useMutation } from "@tanstack/react-query";
import { deleteHotspot } from "../restful-API/hotspotDeleteAPI";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";

export const useDeleteHotspot = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext();
    const router = useRouter();

    return useMutation({
      mutationFn: (wh_num: string) => deleteHotspot(wh_num),
      onSuccess: () => {
        toast.success('Schedule deleted successfully',);
        queryClient.invalidateQueries({ queryKey: ['hotspots'] });
        
        onSuccess?.();
        router.back()
    },
        onError: (err) => {
            console.error("Error archiving schedule:", err);
            toast.error("Failed to archive schedule")
        }
    })
}


