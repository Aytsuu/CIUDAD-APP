// Create a new file: soap-mutations.ts
import { useMutation } from "@tanstack/react-query";
import { deleteFollowUpVisit } from "@/pages/healthServices/vaccination/restful-api/delete";
import {
  createMedicalHistory,
  createFollowUpVisit,
  createMedicineRequest,
  createPEResults,
  createFindings,
  createFindingPlantreatment
} from "../restful-api/create";
import { updateMedicalConsultation } from "../restful-api/update";
import {
  deleteMedicalHistory,
  deleteMedicineRequest,
  deleteFindings,
  deletePEResults,
} from "../restful-api/delete";
import { CircleCheck } from "lucide-react";
import { SoapFormType } from "@/form-schema/doctor/soapSchema";
import { toast } from "sonner";

interface SoapFormSubmissionParams {
  formData: SoapFormType;
  patientData: any;
  MedicalConsultation: any;
  staffId: string;
}
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

export const useSubmitSoapForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      formData,
      patientData,
      MedicalConsultation,
      staffId,
    }: SoapFormSubmissionParams) => {
      let findingId;
      let medHistoryCreated = false;
      let perCreated = false;
      let medRequestId: number | null = null;
      let followv: string | null = null;

      // Show loading toast immediately

      try {
        // 1. Create Findings
        const findingResponse = await createFindings(
          {
            assessment_summary: formData.assessment_summary || "",
            plantreatment_summary: formData.plantreatment_summary || "",
            subj_summary: formData.subj_summary || "",
            obj_summary: formData.obj_summary || "",
          },
          staffId
        );

        findingId = findingResponse.find_id;

        // 2. Create Medicine Request if needed
        if (
          formData.medicineRequest?.medicines &&
          formData.medicineRequest.medicines.length > 0
        ) {
          const medRequestResponse = await createMedicineRequest({
            pat_id: formData.medicineRequest.pat_id,
            medicines: formData.medicineRequest.medicines.map((med) => ({
              minv_id: med.minv_id,
              medrec_qty: med.medrec_qty,
              reason: med.reason || "No reason provided",
            })),
          });
          medRequestId = medRequestResponse.medreq_id;
        }

        console.log("medRequestId", medRequestId)
        
        await createFindingPlantreatment(medRequestId?.toString() || "",findingId)


        // 3. Create Physical Exam Results if needed
        if (
          formData.physicalExamResults &&
          formData.physicalExamResults.length > 0
        ) {
          await createPEResults(formData.physicalExamResults, findingId);
          perCreated = true;
        }

        // 4. Create Follow-up Visit if needed
        if (formData.followv) {
          const followv_response = await createFollowUpVisit(
            MedicalConsultation.patrec ?? "",
            formData.followv ?? ""
          );
          followv = followv_response?.followv_id;
        }

        // 5. Update Medical Consultation status
        await updateMedicalConsultation(
          MedicalConsultation.medrec_id,
          "completed",
          findingId,
          medRequestId ?? undefined,
          followv ?? undefined
        );

        // 6. Create Medical History if illnesses are selected
        if (
          formData.selectedIllnesses &&
          formData.selectedIllnesses.length > 0
        ) {
          const medicalHistoryData = formData.selectedIllnesses.map(
            (illnessId) => ({
              patrec: MedicalConsultation?.patrec,
              ill: illnessId,
              created_at: new Date().toISOString(),
            })
          );
          await createMedicalHistory(medicalHistoryData);
          medHistoryCreated = true;
        }

        // Update loading toast to success
        toast.success("Successfully submitted", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000
        });
        navigate(-1);
        queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] }); // Update with your query key
        queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails",MedicalConsultation?.patrec_details?.pat_id] }); // Update with your query key

        return {
          success: true,
          findingId,
          medRequestId,
          followvId: followv,
        };
      } catch (error) {
        console.error("Error in SOAP form submission:", error);

        // Rollback any successful operations
        try {
          if (medHistoryCreated && MedicalConsultation?.patrec) {
            await deleteMedicalHistory(MedicalConsultation.patrec);
          }
          if (findingId) {
            await updateMedicalConsultation(
              MedicalConsultation.medrec_id,
              "pending"
            );
          }
          if (medRequestId) {
            await deleteMedicineRequest(medRequestId);
          }
          if (perCreated && findingId) {
            await deletePEResults(findingId);
          }
          if (findingId) {
            await deleteFindings(findingId);
          }
          if (followv) {
            await deleteFollowUpVisit(followv);
          }
        } catch (rollbackError) {
          console.error("Error during rollback:", rollbackError);
          toast.error("Failed to fully rollback changes", {
            description: "Please contact support to resolve this issue.",
            duration: 10000,
          });
          throw new Error("Failed to fully rollback changes");
        }

        // Show error toast
        toast.error("Failed to save documentation", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          duration: 10000,
        });

        throw error;
      }
    },
  });
};
