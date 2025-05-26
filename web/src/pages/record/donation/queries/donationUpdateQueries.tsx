import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putdonationreq } from "../request-db/donationPutRequest";
import { Donation } from "./donationFetchQueries"; // Import the Donation type

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ don_num, donationInfo }: { don_num: number; donationInfo: Partial<Donation> }) => 
      putdonationreq(don_num, donationInfo),
    onSuccess: (updatedData, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(["donations"], (old: Donation[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...updatedData } : donation
        )
      );
      
      // Invalidate the query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["donations"] });

      toast.success("Donation updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update donation", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting
      await queryClient.cancelQueries({ queryKey: ['donations'] });

      // Snapshot the previous value
      const previousDonations = queryClient.getQueryData(['donations']);

      // Optimistically update to the new value
      queryClient.setQueryData(['donations'], (old: Donation[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...variables.donationInfo } : donation
        )
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