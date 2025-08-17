import { useQueryClient, useMutation } from "@tanstack/react-query";
import z from "zod"
import { editHotspot, archiveHotspot } from "../restful-API/hotspotPutAPI";
import { toast } from "sonner";
import { WasteHotspotEditSchema } from "@/form-schema/waste-hots-form-schema";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";

export const useEditHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof WasteHotspotEditSchema>) => 
            editHotspot(values.wh_num, { 
                date: values.date,
                start_time: values.start_time,
                end_time: values.end_time,
                additionalInstructions: values.additionalInstructions,
                watchman: values.watchman,
                sitio: values.sitio
            }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['hotspots'] });

                showSuccessToast('Schedule Updated!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error updating schedule:", err);
                showErrorToast("Failed to update schedule. Please check the input data and try again.")
            }
        })
}

export const useArchiveHotspot = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wh_num: number) => archiveHotspot(wh_num),
    onMutate: async (wh_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['hotspots'] });
      
      toast.loading("archiving schedule...", { id: "updateHotspot" });
      
      return { wh_num };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    },
    onError: (err) => {
      showErrorToast("Failed to archived schedule")
      console.error("Failed to archived schedule:", err);
    }
  });
};
