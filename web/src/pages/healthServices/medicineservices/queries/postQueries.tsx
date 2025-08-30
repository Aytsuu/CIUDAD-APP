import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { processMedicineRequest } from "./processSubmit";
import { showSuccessToast } from "@/components/ui/toast";
import { showErrorToast } from "@/components/ui/toast";

export const useMedicineRequestMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ data, staff_id }: { data: any; staff_id: string | null }) => { // Allow null
      return processMedicineRequest(data, staff_id);
    },
    onSuccess: (response) => {
      showSuccessToast(`Medicine request submitted successfully! ${response.uploaded_files_count || 0} files uploaded.`);
      navigate(-1);
    },
    onError: (error: Error) => { // Add type annotation
      console.error("Submission failed:", error);
      showErrorToast(error.message || "Failed to submit medicine request. Please try again.");
    },
  });
};