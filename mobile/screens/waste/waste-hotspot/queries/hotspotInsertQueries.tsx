import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotspot } from "../restful-API/hotspotPostAPI";
import z from "zod"
import { useToastContext } from "@/components/ui/toast";
import { useRouter } from "expo-router";
import { WasteHotspotSchema } from "@/form-schema/waste/waste-hots-form-schema";

export const useAddHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext()
        const router = useRouter();

        return useMutation({
            mutationFn: (values: z.infer<typeof WasteHotspotSchema>) => 
            addHotspot(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['hotspots'] }),
        
                toast.success('Schedule Created!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.")
            }
        })
}