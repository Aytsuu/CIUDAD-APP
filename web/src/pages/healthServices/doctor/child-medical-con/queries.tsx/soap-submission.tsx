// soap-mutations.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { createchildSoapForm } from "../restful-api/post";

export const useSubmitSoapForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, checkupData, staffId }: any) => {
      console.log("Submitting SOAP form with data:", formData, checkupData, staffId);
      const payload = {
        staff_id: staffId,
        patrec_id: checkupData?.chrec_details?.patrec,
        chhist_id: checkupData?.chhist_id,
        chvital_id: checkupData?.child_health_vital_signs?.[0]?.chvital_id,

        // SOAP fields
        assessment_summary: formData.assessment_summary,
        plantreatment_summary: formData.plantreatment_summary,
        subj_summary: formData.subj_summary,
        obj_summary: formData.obj_summary,

        // Medicine request
        medicine_request: formData.medicineRequest
          ? {
              pat_id: formData.medicineRequest.pat_id,
              medicines: formData.medicineRequest.medicines.map((med: any) => ({
                minv_id: med.minv_id,
                medrec_qty: med.medrec_qty,
                reason: med.reason || "No reason provided"
              }))
            }
          : null,

        // Physical exam results
        physical_exam_results: formData.physicalExamResults || [],

        // Illness history
        selected_illnesses: formData.selectedIllnesses || []
      };

      console.log("Payload sent:", payload);

      // Wait for the response and return it
      const response = await createchildSoapForm(payload);
      return response; // This will be passed to onSuccess
    },
    onSuccess: () => {
      showSuccessToast("SOAP Form submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails"] });
      queryClient.invalidateQueries({ queryKey: ["combinedHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["consultationHistory"] });
      queryClient.invalidateQueries({ queryKey: ["pendingSoapForms"] });
      queryClient.invalidateQueries({ queryKey: ["processingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory"] });
      queryClient.invalidateQueries({ queryKey: ["nextufc"] });
      queryClient.invalidateQueries({ queryKey: ["reportscount"] });
      
      navigate(-1);
    },
    onError: (error: Error) => {
      console.error("Error submitting SOAP form:", error);
      showErrorToast(error.message || "Failed to save documentation");
    }
  });
};
