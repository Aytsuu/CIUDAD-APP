// src/hooks/useFirstRequestMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { processFirstRequest } from "./processSubmit";

interface FirstRequestVariables {
  data: any;
  staff_id: string;
}

export const useFirstRequestMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staff_id }: FirstRequestVariables) => 
      processFirstRequest(data, staff_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstaidcount"] });
      queryClient.invalidateQueries({ queryKey: ["firstAidRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientFirstAidDetails"] });
      toast.success("First records submitted successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Submission failed completely:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          `API Error: ${error.response?.data?.message || error.message}`
        );
      } else {
        toast.error(
          `Operation Failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  });
};