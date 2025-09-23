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
    mutationFn: async ({ formData, MedicalConsultation, staffId }: any) => {
      if (!MedicalConsultation || !MedicalConsultation.medrec_id) {
        throw new Error("Medical consultation record is not available");
      }
      const payload = {
        staff_id: staffId,
        medrec_id: MedicalConsultation.medrec_id,
        patrec_id: MedicalConsultation.patrec,
        assessment_summary: formData.assessment_summary || "",
        plantreatment_summary: formData.plantreatment_summary || "",
        subj_summary: formData.subj_summary || "",
        obj_summary: formData.obj_summary || "",
        medicine_request: formData.medicineRequest
          ? {
              pat_id: formData.medicineRequest.pat_id,
              medicines: formData.medicineRequest.medicines.map((med: any) => ({
                minv_id: med.minv_id,
                medreqitem_qty: med.medrec_qty,
                reason: med.reason || "No reason provided"
              }))
            }
          : null,
        physical_exam_results: formData.physicalExamResults || [],
        followv_date: formData.followv || null,
        selected_illnesses: formData.selectedIllnesses || []
      };

      const response = await createMedicalConsultationSoapForm(payload);

      return response;
    },

    onSuccess: (variables) => {
      navigate(-1);
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails", variables.MedicalConsultation?.patrec_details?.pat_id] });
      queryClient.invalidateQueries({ queryKey: ["CombinedHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] });
      queryClient.invalidateQueries({ queryKey: ["consultationHistory"] });
      queryClient.invalidateQueries({ queryKey: ["pendingSoapForms"] });
      queryClient.invalidateQueries({ queryKey: ["processingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequest"] });
      queryClient.invalidateQueries({ queryKey: ["pendingmedrequestitems"] });

      showSuccessToast("SOAP form submitted successfully");
    },
    onError: (error: any) => {
      console.error("Error in SOAP form submission:", error);
      showErrorToast("Error submitting SOAP form");
    }
  });
};
