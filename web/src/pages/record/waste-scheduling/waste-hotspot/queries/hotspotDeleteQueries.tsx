import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteHotspot } from "../restful-API/hotspotDeleteAPI";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";

export const useDeleteHotspot = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (wh_num: string) => deleteHotspot(wh_num),
      onSuccess: () => {
            toast.loading("Deleting schedule...", { id: "deleteHotspot" });

            showSuccessToast('Schedule deleted successfully')

        queryClient.invalidateQueries({ queryKey: ['hotspots'] });
        
        if (onSuccess) onSuccess();
    },
        onError: (err) => {
            console.error("Error archiving schedule:", err);
            showErrorToast("Failed to archive schedule");
        }
    })
}



