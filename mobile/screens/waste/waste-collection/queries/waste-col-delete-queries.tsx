import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { arciveWasteColData } from "../request/waste-col-delete-request";
import { restoreWasteColData } from "../request/waste-col-delete-request";
import { deleteWasteColData } from "../request/waste-col-delete-request";


export const useArchiveWasteCol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();  
  
  return useMutation({
    mutationFn: (wc_num: number) => arciveWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully archived schedule");
    },
    onError: (err) => {
      toast.error("Failed to archived schedule");
      console.error("Failed to archived schedule:", err);
    }
  });
};



export const useRestoreWasteCol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();  

  return useMutation({
    mutationFn: (wc_num: number) => restoreWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully restored schedule");
    },
    onError: (err) => {
      toast.error("Failed to restore schedule");
      console.error("Failed to restore schedule:", err);
    }
  });
};




export const useDeleteWasteCol = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();    
  
  return useMutation({
    mutationFn: (wc_num: number) => deleteWasteColData(wc_num),
    onMutate: async (wc_num) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['wasteCollectionSchedFull'] });
     
      return { wc_num };
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      
      // Show success toast
      toast.success("Successfully deleted schedule");
    },
    onError: (err) => {
      toast.error("Failed to delete schedule");
      console.error("Failed to delete schedule:", err);
    }
  });
};