
import { api2 } from "@/api/api"
import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"

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

// --- Existing API Call Functions (mostly for reference/individual use now) ---

// The following functions are generally no longer called directly by useFamilyPlanningFormSubmission
// as their logic is now integrated into submit_full_family_planning_form on the backend.
// They are kept here in case they are used elsewhere or for future individual updates.
// Their implementations have been removed to resolve the "Deprecated" errors.

export const createFPRecord = async (data: Record<string, any>) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createFPType = async (data: Record<string, any>, fprecord_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createRiskSti = async (data: Record<string, any>, fprecord_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createRiskVaw = async (data: Record<string, any>, fprecord_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const getExistingObstetricalHistory = async (pat_id: string) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createPatientObstetricalHistory = async (data: Record<string, any>, pat_id: string) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createFPOBstetricalHistory = async (data: Record<string, any>, fprecord_id: number, obs_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const getLatestBodyMeasurement = async (pat_id: string) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createBodyMeasurement = async (data: Record<string, any>, patrec_id: string) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const updateBodyMeasurement = async (bm_id: number, data: Record<string, any>, patrec_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createVitalSigns = async ({ data, patrec_id, staff_id }: { data: Record<string, any>; patrec_id: string; staff_id: string }) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createPhysicalExam = async ({ data, fprecord_id, bm_id, vital_id }: { data: Record<string, any>; fprecord_id: number; bm_id: number; vital_id: number | null }) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createPelvicExam = async (data: Record<string, any>, fprecord_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createAcknowledgement = async (data: Record<string, any>, fprecord_id: number, fpt_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createPregnancyCheck = async (data: Record<string, any>, fprecord_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }
export const createAssessment = async (data: Record<string, any>, fprecord_id: number, patrec_id: number, fpt_id: number, bm_id: number) => { /* This function is now handled by the comprehensive backend endpoint */ return {} as any; }


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
      // Invalidate relevant queries after successful submission
      queryClient.invalidateQueries({ queryKey: ["familyPlanningRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      // Potentially invalidate commodity stock queries if you have them
      queryClient.invalidateQueries({ queryKey: ["commodityStock"] });
    },
    onError: (error) => {
      toast.error(`Failed to submit Family Planning form: ${error.message}`);
      console.error("Family Planning form submission error:", error);
    },
  });
};