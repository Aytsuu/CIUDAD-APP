// src/hooks/useMedicineRequestMutation.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { processMedicineRequest } from "./processSubmit";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useMedicineRequestMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ data, staff_id }: { data: any; staff_id: string }) => {
      return processMedicineRequest(data, staff_id);
    },
    onSuccess: () => {
      showSuccessToast("Medicine request submitted successfully!");
      navigate(-1);
    },
    onError: (error) => {
      console.error("Submission failed completely:", error);
      showErrorToast("Failed to submit medicine request. Please try again.");
      
    },
  });
};