import { useQueryClient, useMutation } from "@tanstack/react-query";
import { addGarbagePickupRequest } from "../restful-API/garbagePickupResidentPostAPI";
import { useRouter } from "expo-router";
import { useToastContext } from "@/components/ui/toast";
import { garbagePickupRequestCreateSchema } from "@/form-schema/waste/garbage-pickup-schema-resident";
import z from "zod"

export const useAddaGarbagePickupRequest = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();
        const router = useRouter();

        return useMutation({
            mutationFn: (data: {values: z.infer<typeof garbagePickupRequestCreateSchema>; files: {name: string | undefined; type: string | undefined; file: string | undefined }[]}) => 
            addGarbagePickupRequest(data.values, data.files),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['garbageRequest'] });

                toast.success('Request Submitted!')
                onSuccess?.()
                router.back()
            },
            onError: (err) => {
                console.error("Error submitting request:", err);
                toast.error("Failed to submit request. Please check the input data and try again.");
            }
        })
}