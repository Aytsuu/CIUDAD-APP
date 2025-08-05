import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postdonationreq } from "../request-db/donationPostRequest";
import { DonationInput } from "../donation-types";

export const useAddDonation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (donationData: DonationInput) => postdonationreq(donationData),
    onSuccess: (don_num) => {
      // Invalidate the donations query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["donations"] });

      // Show success toast
      toast.success("Donation added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });

      // Optionally navigate to the donations list
      navigate("/donation-record");
    },
    onError: (error: Error) => {
      toast.error("Failed to add donation", {
        description: error.message,
      });
    },
  });
};