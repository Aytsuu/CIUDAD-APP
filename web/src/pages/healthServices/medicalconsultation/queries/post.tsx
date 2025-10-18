import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { api2 } from "@/api/api";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";

export const useSubmitMedicalConsultation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      console.log("Submitting medical consultation data:", data);
      const response = await api2.post("/medical-consultation/create-medical-consultation-record-step1/", data);
      return response.data;
    },
    onSuccess: () => {
      showSuccessToast("Medical record created successfully");
      queryClient.invalidateQueries({ queryKey: ["medicalConsultations"] });
      queryClient.invalidateQueries({ queryKey: ["combinedHealthRecords"] });
      
      navigate(-1);
    },
    onError: (error: any) => {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        showErrorToast(`Error: ${error.response.data.error || "Something went wrong"}`);
      } else {
        toast.error(error.message || "Error setting up request.");
      }
    }
  });
};
