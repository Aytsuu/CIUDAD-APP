// src/hooks/useMedicineRequestMutation.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { processMedicineRequest } from "./processSubmit";

export const useMedicineRequestMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ data, staff_id }: { data: any; staff_id: string }) => {
      return processMedicineRequest(data, staff_id);
    },
    onSuccess: () => {
      toast.success("All medicine records submitted successfully!");
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