import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { updateCertificationStatus } from "../restful-api/certificatePutAPI";

export const useUpdateCertStatus = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (cr_id: string) => 
        updateCertificationStatus(cr_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificates'] });
    
            toast.success('Marked as complete', {
                id: "completereq",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            onSuccess?.()
        },
        onError: (err) => {
            console.error("Error marking request:", err);
            toast.error(
                "Failed to marking request. Please check the input data and try again.",
                { duration: 2000 }
            );
        }
    })
}



