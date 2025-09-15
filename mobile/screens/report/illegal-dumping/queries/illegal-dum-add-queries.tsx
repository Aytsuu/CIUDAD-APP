import z from "zod"
import IllegalDumpResSchema from "@/form-schema/waste/waste-illegal-dump-res";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { addWasteReport } from "../request/illegal-dump-post-request";

type FileData = {
    name: string;
    type: string;
    file: string;
};

type ExtendedIllegalDump = z.infer<typeof IllegalDumpResSchema> & {
  files: FileData[];
};


export const useAddWasteReport = (onSuccess?: () => void) => {
        const queryClient = useQueryClient();
        const {toast} = useToastContext();

        return useMutation({
            mutationFn: (values: ExtendedIllegalDump) => 
            addWasteReport(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['wastereport'] });

                toast.success('Report Submitted!')
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting report:", err);
                toast.error("Failed to submit report. Please check the input data and try again.");
            }
        })
}