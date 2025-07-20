// Create a new file: soap-mutations.ts
import { useMutation } from "@tanstack/react-query";
import { deleteFollowUpVisit } from "@/pages/healthServices/vaccination/restful-api/post";
import {
  createMedicalHistory,
  createFollowUpVisit,
  createMedicineRequest,
  createPEResults,
  createFindings,
  createFindingPlantreatment,
} from "../../restful-api/create";
import { updateMedicalConsultation } from "../../restful-api/update";
import {
  deleteMedicalHistory,
  deleteMedicineRequest,
  deleteFindings,
  deletePEResults,
  deleteNotes,
} from "../../restful-api/delete";
import {
  updateChildHistoryStatus,
  updateChildVitalSigns,
} from "../../restful-api/update";
import { SoapFormType } from "@/form-schema/doctor/soapSchema";
import { toast } from "sonner";
import { createChildHealthNotes } from "@/pages/healthServices/childservices/forms/restful-api/createAPI";
import {CircleCheck} from "lucide-react";
interface SoapFormSubmissionParams {
  formData: SoapFormType;
  patientData: any;
  checkupData: any;
  staffId: string;
}
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { string } from "zod";

export const useSubmitSoapForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      formData,
      patientData,
      checkupData,
      staffId,
    }: SoapFormSubmissionParams) => {
      let findingId;
      let medHistoryCreated = false;
      let perCreated = false;
      let medRequestId: number | null = null;
      let followv: string | null = null;
      let chnotes_id: string | null = null;
      const chvital_id =
        checkupData?.child_health_vital_signs?.[0]?.chvital_id || "";
      console.log("chvitalId", chvital_id);
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

        console.log("medRequestId", medRequestId);

        await createFindingPlantreatment(
          medRequestId?.toString() || "",
          findingId
        );

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
            checkupData.patrec ?? "",
            formData.followv ?? ""
          );
          followv = followv_response?.followv_id;
        }

        const chnotes_res = await createChildHealthNotes({
          chn_notes: "", // Replace 'patrec' with a valid property name
          chhist: checkupData.chhist_id,
          followv: followv,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          staff: staffId,
        });
        chnotes_id = chnotes_res?.chnotes_id;

        const vitalSignsData = {
          child_health_vital_signs: [
            {
              chvital_id:
                checkupData?.child_health_vital_signs?.[0]?.chvital_id || 0,
              // other fields...
            },
          ],
        };

        console.log("vitalSignsData", vitalSignsData);
        // Then use it in your function call
        await updateChildVitalSigns(
          vitalSignsData.child_health_vital_signs[0].chvital_id,
          findingId
        );

        // 5. Update Medical Consultation status
        await updateChildHistoryStatus(checkupData.chhist_id, "recorded");

        // 6. Create Medical History if illnesses are selected
        if (
          formData.selectedIllnesses &&
          formData.selectedIllnesses.length > 0
        ) {
          const medicalHistoryData = formData.selectedIllnesses.map(
            (illnessId) => ({
              patrec: checkupData?.patrec,
              ill: illnessId,
              created_at: new Date().toISOString(),
            })
          );
          await createMedicalHistory(medicalHistoryData);
          medHistoryCreated = true;
        }

        // Update loading toast to success
        toast.success("Project proposal restored successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000
        });

        navigate(-1);
        queryClient.invalidateQueries({ queryKey: ["MedicalRecord"] }); // Update with your query key
        queryClient.invalidateQueries({ queryKey: ["patientMedicalDetails"] }); // Update with your query key

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
          if (medHistoryCreated && checkupData?.patrec) {
            await deleteMedicalHistory(checkupData.patrec);
          }
          if (findingId) {
            await updateChildHistoryStatus(checkupData.chhist_id, "check-up");
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
          if (chnotes_id) {
            await deleteNotes(chnotes_id);
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
