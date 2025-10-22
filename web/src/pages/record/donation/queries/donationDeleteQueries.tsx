import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { deldonationreq } from "../request-db/donationDelRequest";
import { Donation } from "../donation-types";

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (don_num: string) => deldonationreq(don_num),
    onSuccess: (_, don_num) => {
      queryClient.setQueryData(["donations"], (old: Donation[] = []) => 
        old.filter(donation => donation.don_num !== don_num)
      );
      queryClient.invalidateQueries({ queryKey: ["donations"] });

      showSuccessToast("Donation deleted successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to delete donation");
    },
    onMutate: async (don_num) => {
      await queryClient.cancelQueries({ queryKey: ['donations'] });
      const previousDonations = queryClient.getQueryData(['donations']);
      queryClient.setQueryData(['donations'], (old: Donation[] = []) => 
        old.filter(donation => donation.don_num !== don_num)
      );
      return { previousDonations };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });
};