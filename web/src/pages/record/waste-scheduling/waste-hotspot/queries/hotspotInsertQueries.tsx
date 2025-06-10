import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addHotspot } from "../restful-API/hotspotPostAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import z from "zod"
import WasteHotspotSchema from "@/form-schema/waste-hots-form-schema";

export const useAddHotspot = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();

        return useMutation({
            mutationFn: (values: z.infer<typeof WasteHotspotSchema>) => 
            addHotspot(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['hotspots'] }),

                toast.loading('Creating Schedule...', {id: "createhotspot"});
        
                toast.success('Schedule Created!', {
                    id: "createhotspot",
                    icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                    duration: 2000
                });
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error(
                    "Failed to submit record. Please check the input data and try again.",
                    { duration: 2000 }
                );
            }
        })
}