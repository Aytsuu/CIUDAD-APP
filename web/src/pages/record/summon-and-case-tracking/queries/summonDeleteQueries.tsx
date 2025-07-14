import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteSuppDoc } from "../requestAPI/summonDeleteAPI";
import { useQueryClient, useMutation } from "@tanstack/react-query";

export const useDeleteSuppDoc = (onSuccess?: () => void) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (csd_id: string) => deleteSuppDoc(csd_id),
        onMutate: () =>{
            toast.loading("Deleting document ...", { id: "deleteSuppDoc" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppDocs'] });

            toast.success('Document is deleted successfully', {
                id: "deleteSuppDoc",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
            
            onSuccess?.();
        },
        onError: (err) => {
            console.error("Error deleting document:", err);
            toast.error("Failed to delete document", {
            id: "deleteSuppDoc",
            duration: 2000
            });
        }
    })
}