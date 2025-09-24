// src/hooks/useFirstRequestMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { processFirstRequest } from "./processSubmit";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

export const useFirstRequestMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: any;}) => {
      return processFirstRequest(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidcount"] });
      queryClient.invalidateQueries({ queryKey: ["firstAidRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientFirstAidDetails"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidStocks"] });
      showSuccessToast("First Aid request submitted successfully!");
      navigate(-1);
    },
    onError: (error: Error) => {
      console.error("Submission failed:", error);
      showErrorToast(error.message || "Failed to submit first aid request. Please try again.");
    },
  });
};