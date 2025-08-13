import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { arciveWasteColData } from "../request/wasteColDeleteRequest";
import { restoreWasteColData } from "../request/wasteColDeleteRequest";
import { deleteWasteColData } from "../request/wasteColDeleteRequest";



export const useArchiveWasteCol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wc_num: number) => arciveWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show loading toast
      toast.loading("archiving schedule...", { id: "deleteWaste" });
      
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully archived schedule", {
        id: "deleteWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 6000
      });
    },
    onError: (err) => {
      toast.error("Failed to archived schedule", {
        id: "deleteToast",
        duration: 6000
      });
      console.error("Failed to archived schedule:", err);
    }
  });
};



export const useRestoreWasteCol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wc_num: number) => restoreWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show loading toast
      toast.loading("restoring schedule...", { id: "deleteWaste" });
      
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully restored schedule", {
        id: "deleteWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 6000
      });
    },
    onError: (err) => {
      toast.error("Failed to restore schedule", {
        id: "deleteToast",
        duration: 6000
      });
      console.error("Failed to restore schedule:", err);
    }
  });
};




export const useDeleteWasteCol = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (wc_num: number) => deleteWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show loading toast
      toast.loading("deleting schedule...", { id: "deleteWaste" });
      
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully deleted schedule", {
        id: "deleteWaste",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 6000
      });
    },
    onError: (err) => {
      toast.error("Failed to delete schedule", {
        id: "deleteToast",
        duration: 6000
      });
      console.error("Failed to delete schedule:", err);
    }
  });
};