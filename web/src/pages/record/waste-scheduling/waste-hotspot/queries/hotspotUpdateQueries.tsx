import { useQueryClient, useMutation } from "@tanstack/react-query";
import z from "zod"
import { editHotspot, archiveHotspot } from "../restful-API/hotspotPutAPI";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { WasteHotspotEditSchema } from "@/form-schema/waste-hots-form-schema";


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

                toast.loading('Updating Schedule...', {id: "editHotspot"});
        
                toast.success('Schedule Updated!', {
                    id: "editHotspot",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error updating schedule:", err);
                toast.error(
                    "Failed to update schedule. Please check the input data and try again.",
                    { duration: 2000 }
                );
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
      
      // Show loading toast
      toast.loading("archiving schedule...", { id: "updateHotspot" });
      
      return { wh_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
    },
    onError: (err) => {
      toast.error("Failed to archived schedule", {
        id: "updateHotspot",
        duration: 6000
      });
      console.error("Failed to archived schedule:", err);
    }
  });
};
