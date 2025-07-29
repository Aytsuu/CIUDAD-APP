import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deldonationreq } from "../request-db/donationDelRequest";

export type Donation = {
  don_num: string;
  don_donorfname: string; 
  don_donorlname: string;
  don_item_name: string;
  don_qty: number;
  don_category: string;
  don_receiver: string;
  don_description?: string;
  don_date: string;
};


export const useDeleteDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (don_num: string) => deldonationreq(don_num),
    onSuccess: (_, don_num) => {
      // Optimistically update the cache
      queryClient.setQueryData(["donations"], (old: Donation[] = []) => 
        old.filter(donation => donation.don_num !== don_num)
      );
      
      // Invalidate the query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["donations"] });

      toast.success("Donation deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete donation", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (don_num) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['donations'] });

      // Snapshot the previous value
      const previousDonations = queryClient.getQueryData(['donations']);

      // Optimistically update to the new value
      queryClient.setQueryData(['donations'], (old: Donation[] = []) => 
        old.filter(donation => donation.don_num !== don_num)
      );

      // Return a context with the previous value
      return { previousDonations };
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });
};