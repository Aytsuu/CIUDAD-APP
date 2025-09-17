// FileName: /PostRequest.tsx
import { api2 } from "@/api/api"
import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { showErrorToast } from "@/components/ui/toast"

// --- Comprehensive API Calls ---

// Centralized API call for full form submission (New Record Set)
export const submitFullFamilyPlanningForm = async (formData: FormData) => {
  try {
    console.log("🚀 Sending full form data to comprehensive backend endpoint (New Record Set):", formData);
    const response = await api2.post("/familyplanning/submit-full-form/", formData);
    console.log("✅ Full form submission (New Record Set) successful:", response.data);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Full form submission (New Record Set) API Error:", err.response?.data || err.message);
      throw new Error(`Submission failed: ${err.response?.data?.detail || err.message}`);
    }
    console.error("❌ Unexpected Error during full form submission (New Record Set):", err);
    throw err;
  }
};

// Centralized API call for follow-up form submission (Reuse PatientRecord)
export const submitFollowUpFamilyPlanningForm = async (formData: FormData) => {
  try {
    console.log("🚀 Sending follow-up form data to backend endpoint (Reuse PatientRecord):", formData);
    // Ensure patrec_id is included in formData for this endpoint
    if (!formData.patrec_id) {
      throw new Error("patrec_id is required for follow-up submission.");
    }
    const response = await api2.post("/familyplanning/submit-follow-up-form/", formData);
    console.log("✅ Follow-up form submission successful:", response.data);
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Follow-up form submission API Error:", err.response?.data || err.message);
      throw new Error(`Submission failed: ${err.response?.data?.detail || err.message}`);
    }
    console.error("❌ Unexpected Error during follow-up form submission:", err);
    throw err;
  }
};


// --- React Query Mutation Hooks ---

// Mutation for "New Record Set" flow
export const useFamilyPlanningFormSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitFullFamilyPlanningForm,
    onSuccess: () => {
      toast.success("Family Planning record created successfully!");
      // Invalidate relevant queries to refetch data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ["familyPlanningRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] }); // If you have a general patient list
      queryClient.invalidateQueries({ queryKey: ["commodityStock"] }); // If stock changes on submission
      queryClient.invalidateQueries({ queryKey: ["individualFPRecordsList"] }); // To update the individual patient's list
      queryClient.invalidateQueries({ queryKey: ["latestFpRecord"] }); // To ensure latest data is fetched next time
    },
    onError: (error) => {
      showErrorToast(`Failed to submit Family Planning form: ${error.message}`);
      console.error("Family Planning form submission error:", error);
    },
  });
};

// Mutation for "Add Follow-up" flow
export const useFollowUpFamilyPlanningFormSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitFollowUpFamilyPlanningForm,
    onSuccess: () => {
      toast.success("Family Planning follow-up record created successfully!");
      // Invalidate relevant queries to refetch data in other parts of the app
      queryClient.invalidateQueries({ queryKey: ["familyPlanningRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      queryClient.invalidateQueries({ queryKey: ["commodityStock"] });
      queryClient.invalidateQueries({ queryKey: ["individualFPRecordsList"] }); // To update the individual patient's list
      queryClient.invalidateQueries({ queryKey: ["latestFpRecord"] }); // To ensure latest data is fetched next time
    },
    onError: (error) => {
      showErrorToast(`Failed to submit Family Planning follow-up form: ${error.message}`);
      console.error("Family Planning follow-up form submission error:", error);
    },
  });
};
