import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import { postdonationreq } from "../request-db/donationPostRequest";
import { DonationInput } from "../donation-types";

export const useAddDonation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (donationData: DonationInput) => postdonationreq(donationData),
    onSuccess: (_don_num) => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      showSuccessToast("Donation added successfully");
      navigate("/donation-record");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to add donation");
    },
  });
};