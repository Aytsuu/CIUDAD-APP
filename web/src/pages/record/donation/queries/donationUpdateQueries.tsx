import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { putdonationreq } from "../request-db/donationPutRequest";
import { Donations } from "../donation-types";

export const useUpdateDonation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ don_num, donationInfo }: { don_num: string; donationInfo: Partial<Donations> }) => 
      putdonationreq(don_num, donationInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["donations"], (old: Donations[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...updatedData } : donation
        )
      );
      queryClient.invalidateQueries({ queryKey: ["donations"] });

      showSuccessToast("Donation updated successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to update donation");
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['donations'] });
      const previousDonations = queryClient.getQueryData(['donations']);
      queryClient.setQueryData(['donations'], (old: Donations[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...variables.donationInfo } : donation
        )
      );
      return { previousDonations };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });
};