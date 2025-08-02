
import { api2 } from "@/api/api"
import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { showErrorToast } from "@/components/ui/toast"

// --- Medical History API Functions (NEW) ---
// These individual functions are now primarily for reference or if you need to call them outside the main flow.
// The comprehensive submission endpoint will handle their creation internally.
export const createMedicalHistoryRecords = async (patrec_id: number, selectedIllnessIds: number[]) => {
  try {
    console.log("📌 Creating medical history records (individual call):", { patrec_id, selectedIllnessIds })

    if (selectedIllnessIds.length === 0) {
      console.log("No illnesses selected, skipping medical history creation")
      return { message: "No medical history to create", records: [] }
    }

    const response = await api2.post("/familyplanning/medical-history/create/", {
      patrec_id,
      selected_illness_ids: selectedIllnessIds,
    })

    console.log("✅ Medical history records created:", response.data)
    return response.data
  } catch (err) {
    console.error("❌ Failed to create medical history records:", err)
    throw err
  }
}
export const createFPRecord = async () => { return {} as any; }
export const createFPType = async () => { return {} as any; }
export const createRiskSti =async () => { return {} as any; }
export const createRiskVaw = async () => { return {} as any; }
export const getExistingObstetricalHistory = async () => { return {} as any; }
export const createPatientObstetricalHistory = async () => { return {} as any; }
export const createFPOBstetricalHistory = async () => { return {} as any; }
export const getLatestBodyMeasurement = async () => { return {} as any; }
export const createBodyMeasurement = async () => { return {} as any; }
export const updateBodyMeasurement = async () => { return {} as any; }
export const createVitalSigns = async () => { return {} as any; }
export const createPhysicalExam = async () => { return {} as any; }
export const createPelvicExam = async () => { return {} as any; }
export const createAcknowledgement = async () => { return {} as any; }
export const createPregnancyCheck = async () => { return {} as any; }
export const createAssessment = async () => { return {} as any; }


// NEW: Centralized API call for full form submission
export const submitFullFamilyPlanningForm = async (formData: FormData) => {
  try {
    console.log("🚀 Sending full form data to comprehensive backend endpoint:", formData);
    const response = await api2.post("/familyplanning/submit-full-form/", formData);
    console.log("✅ Full form submission successful:", response.data);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Full form submission API Error:", err.response?.data || err.message);
      throw new Error(`Submission failed: ${err.response?.data?.detail || err.message}`);
    }
    console.error("❌ Unexpected Error during full form submission:", err);
    throw err;
  }
};


// --- React Query Mutation Hooks ---

// Only keep the mutation for the new comprehensive endpoint
export const useFamilyPlanningFormSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitFullFamilyPlanningForm,
    onSuccess: () => {
      toast.success("Family Planning record created successfully!");
      queryClient.invalidateQueries({ queryKey: ["familyPlanningRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      // Potentially invalidate commodity stock queries if you have them
      queryClient.invalidateQueries({ queryKey: ["commodityStock"] });
    },
    onError: (error) => {
      showErrorToast(`Failed to submit Family Planning form: ${error.message}`);
      console.error("Family Planning form submission error:", error);
    },
  });
};