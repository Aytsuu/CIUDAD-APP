import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteResolution } from "../request/resolution-delete-request";


export const useDeleteResolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (res_num: number) => deleteResolution(res_num),
    onMutate: async (res_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['resData'] });
      
      // Show loading toast
      toast.loading("Deleting resolution...", { id: "deleteRes" });
      
      return { res_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['resData'] });
      
      // Show success toast
      toast.success("Resolution deleted", {
        id: "deleteRes",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete resolution", {
        id: "deleteToast",
        duration: 1000
      });
      console.error("Failed to delete resolution:", err);
    }
  });
};
