// src/hooks/useFirstRequestMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { processFirstRequest } from "./processSubmit";
import { showSuccessToast,showErrorToast } from "@/components/ui/toast";

export const useFirstRequestMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { data: any }) => 
      processFirstRequest(data.data), // Destructure the data property
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidcount"] });
      queryClient.invalidateQueries({ queryKey: ["firstAidRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientFirstAidDetails"] });
      showSuccessToast("Submitted successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Submission failed completely:", error);
      showErrorToast("Submission failed")
    
    },
  });
};