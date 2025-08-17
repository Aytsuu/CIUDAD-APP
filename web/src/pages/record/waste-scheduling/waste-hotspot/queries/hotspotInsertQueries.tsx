import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotspot } from "../restful-API/hotspotPostAPI";
import z from "zod"
import { WasteHotspotSchema } from "@/form-schema/waste-hots-form-schema";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useAddHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof WasteHotspotSchema>) => 
            addHotspot(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['hotspots'] }),
                showSuccessToast('Schedule Created!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                showErrorToast("Failed to submit record. Please check the input data and try again.")
            }
        })
}