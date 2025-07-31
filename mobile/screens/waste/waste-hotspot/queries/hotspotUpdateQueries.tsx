import { useQueryClient, useMutation } from "@tanstack/react-query";
import z from "zod"
import { editHotspot } from "../restful-API/hotspotPutAPI";
import { WasteHotspotEditSchema } from "@/form-schema/waste/waste-hots-form-schema";
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";


export const useEditHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext()
        const router = useRouter()

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
        
                toast.success('Schedule Updated!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error updating schedule:", err);
                toast.error("Failed to update schedule. Please check the input data and try again.")
            }
        })
}