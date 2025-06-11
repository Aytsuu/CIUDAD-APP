import { useQueryClient, useMutation } from "@tanstack/react-query";
import z from "zod"
import { editHotspot } from "../restful-API/hotspotPutAPI";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { WasteHotspotEditSchema } from "@/form-schema/waste-hots-form-schema";


export const useEditHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof WasteHotspotEditSchema>) => 
            editHotspot(values.wh_num, { 
                date: values.date,
                time: values.time,
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