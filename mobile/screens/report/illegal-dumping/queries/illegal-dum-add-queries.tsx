import z from "zod"
import IllegalDumpResSchema from "@/form-schema/waste/waste-illegal-dump-res";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { addWasteReport } from "../request/illegal-dump-post-request";


export const useAddWasteReport = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();

        return useMutation({
            mutationFn: (values: z.infer<typeof IllegalDumpResSchema>) => 
            addWasteReport(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wasteResReport'] });

                toast.success('Report Submitted!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting report:", err);
                toast.error("Failed to submit report. Please check the input data and try again.");
            }
        })
}