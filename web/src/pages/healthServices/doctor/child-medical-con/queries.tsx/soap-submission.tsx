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
      const payload = {
        staff_id: staffId,
        medrec_id: checkupData?.medrec_id,
        patrec_id: checkupData?.patrecy,
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
      createchildSoapForm(payload);
    },
    onSuccess: () => {
      showSuccessToast("SOAP Form submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails"] });
      navigate(-1);
    },
    onError: () => {
      showErrorToast("Failed to save documentation");
    }
  });
};
