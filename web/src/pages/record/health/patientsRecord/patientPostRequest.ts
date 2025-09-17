import { showErrorToast } from "@/components/ui/toast";
import type { PatientRecordFormValues } from "@/pages/record/health/patientsRecord/patients-record-schema"

export const personal = async (data: PatientRecordFormValues) => {
  try {
    console.log("Submitting patient data:", data);

    await new Promise(resolve => setTimeout(resolve, 1000));

    return { success: true };
  } catch (error) {
    console.error("Error submitting patient data:", error);
    showErrorToast("Failed to submit patient data. Please try again.");
    return { success: false };
  }
}
