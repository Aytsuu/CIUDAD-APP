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
        pat_id: formData.medicineRequest?.pat_id,

        is_cbc: formData.is_cbc,
        is_urinalysis: formData.is_urinalysis,
        is_fecalysis: formData.is_fecalysis,
        is_sputum_microscopy: formData.is_sputum_microscopy,
        is_creatine: formData.is_creatine,
        is_hba1c: formData.is_hba1c,
        is_chestxray: formData.is_chestxray,
        is_papsmear: formData.is_papsmear,
        is_fbs: formData.is_fbs,
        is_oralglucose: formData.is_oralglucose,
        is_lipidprofile: formData.is_lipidprofile,
        is_ecg: formData.is_ecg,
        is_fecal_occult_blood: formData.is_fecal_occult_blood,
        others: formData.others,
        
        // SOAP fields
        assessment_summary: formData.assessment_summary,
        plantreatment_summary: formData.plantreatment_summary,
        subj_summary: formData.subj_summary,
        obj_summary: formData.obj_summary,

        // ✅ FIXED: Correct field name
        medicineRequest: formData.medicineRequest
          ? {
              pat_id: formData.medicineRequest.pat_id,
              mode: formData.medicineRequest.mode || "walk-in",
              medicines: formData.medicineRequest.medicines.map((med: any) => ({
                minv_id: med.minv_id,
                medrec_qty: med.medrec_qty,
                reason: med.reason || "No reason provided",
              })),
            }
          : null,

        // Physical exam results
        physical_exam_results: formData.physicalExamResults || [],

        // Illness history
        selected_illnesses: formData.selectedIllnesses || [],
      };

      console.log("Payload sent:", payload);

      const response = await createchildSoapForm(payload);
      return response;
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
    },
  });
};