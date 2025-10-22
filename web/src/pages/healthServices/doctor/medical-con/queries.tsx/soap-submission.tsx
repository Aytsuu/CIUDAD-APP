// soap-mutations.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { createMedicalConsultationSoapForm } from "../restful-api/create";

export const useSubmitSoapForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, MedicalConsultation }: any) => {
      if (!MedicalConsultation || !MedicalConsultation.medrec_id) {
        throw new Error("Medical consultation record is not available");
      }

      // Just pass formData directly - no transformations needed
      const response = await createMedicalConsultationSoapForm(formData);
      return response;
    },

    onSuccess: (variables) => {
      navigate(-1);

      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails", variables.MedicalConsultation?.patrec_details?.pat_id] });
      queryClient.invalidateQueries({ queryKey: ["combinedHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["consultationHistory"] });
      queryClient.invalidateQueries({ queryKey: ["pendingSoapForms"] });
      queryClient.invalidateQueries({ queryKey: ["processingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });
      queryClient.invalidateQueries({ queryKey: ["reportscount"] });
      showSuccessToast("SOAP form submitted successfully");
    },

    onError: (error: any) => {
      console.error("Error in SOAP form submission:", error);
      showErrorToast("Error submitting SOAP form");
    }
  });
};

// queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
// queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails", variables.MedicalConsultation?.patrec_details?.pat_id] });
// queryClient.invalidateQueries({ queryKey: ["combinedHealthRecords"] });
// queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
// queryClient.invalidateQueries({ queryKey: ["consultationHistory"] });
// queryClient.invalidateQueries({ queryKey: ["pendingSoapForms"] });
// queryClient.invalidateQueries({ queryKey: ["processingmedrequest"] });
// queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
// queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });
// queryClient.invalidateQueries({ queryKey: ["reportscount"] });
