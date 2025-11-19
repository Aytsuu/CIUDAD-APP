// src/services/childHealthAPI.ts
import { api2 } from "@/api/api";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord?: any;
  originalRecord?: any;
}

export interface AddRecordResult {
  success: boolean;
  message: string;
  data: any;
}

/**
 * Comprehensive function that sends all child health record data to the single API endpoint
 * This matches the backend UpdateChildHealthRecordAPIView structure
 */
export async function updateChildHealthRecord({ submittedData, staff, todaysHistoricalRecord, originalRecord }: AddRecordArgs): Promise<AddRecordResult> {
  // Basic validation on frontend
  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }

  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  try {
    console.log("Sending child health update data to comprehensive API endpoint...");

    // Transform the data to match what the backend expects
    const requestData = {
      submittedData: {
        // Patient info
        pat_id: submittedData.pat_id,
        trans_id: submittedData.trans_id,
        residenceType: submittedData.residenceType,

        // Child health record fields
        ufc_no: submittedData.ufcNo,
        family_no: submittedData.familyNo,
        place_of_delivery_type: submittedData.placeOfDeliveryType,
        pod_location: submittedData.placeOfDeliveryLocation,
        mother_occupation: submittedData.motherOccupation,
        father_occupation: submittedData.fatherOccupation,
        birth_order: submittedData.birth_order,
        newborn_screening: submittedData.dateNewbornScreening,
        landmarks: submittedData.landmarks,
        nbscreening_result: submittedData.nbscreening_result,
        newbornInitiatedbf: submittedData.newbornInitiatedbf,
        selectedStaffId: submittedData.selectedStaffId,

        // Child health history
        status: submittedData.status,
        tt_status: submittedData.tt_status,
        created_at: submittedData.created_at,

        // Vital signs and measurements
        vitalSigns: submittedData.vitalSigns?.map((vital) => ({
          ...vital,
          ht: vital.ht ? Number(vital.ht) : null,
          wt: vital.wt ? Number(vital.wt) : null,
          temp: vital.temp ? Number(vital.temp) : null,
        })),
        nutritionalStatus: submittedData.nutritionalStatus
          ? {
              ...submittedData.nutritionalStatus,
              muac: submittedData.nutritionalStatus.muac ? Number(submittedData.nutritionalStatus.muac) : null,
            }
          : null,
        childAge: submittedData.childAge,
        edemaSeverity: submittedData.edemaSeverity,

        // Breastfeeding dates
        BFchecks: submittedData.BFchecks,

        // Medicines
        medicines: submittedData.medicines?.map((med) => ({
          ...med,
          medrec_qty: Number(med.medrec_qty),
        })),

        // Supplement statuses
        historicalSupplementStatuses: submittedData.historicalSupplementStatuses?.map((status) => ({
          ...status,
          chssupplementstat_id: status.chssupplementstat_id,
          date_completed: status.date_completed || null,
        })),

        birthwt: submittedData.birthwt,
        anemic: submittedData.anemic,

        // Transient parent information
        mother_fname: submittedData.motherFname,
        mother_lname: submittedData.motherLname,
        mother_mname: submittedData.motherMname,
        mother_age: submittedData.motherAge,
        mother_dob: submittedData.motherdob,
        father_fname: submittedData.fatherFname,
        father_lname: submittedData.fatherLname,
        father_mname: submittedData.fatherMname,
        father_age: submittedData.fatherAge,
        father_dob: submittedData.fatherdob,
        passed_status: submittedData.passed_status || "recorded",
      },
      staff: staff,
      todaysHistoricalRecord: todaysHistoricalRecord,
      originalRecord: originalRecord,
    };

    console.log("Hey", requestData);
    // Make API call to the comprehensive update endpoint
    const response = await api2.post("child-health/create-update-new-chhistory/", requestData);

    if (response.status === 200 || response.status === 201) {
      return {
        success: response.data.success,
        message: response.data.message,
        data: {
          patrec_id: response.data.data.patrec_id,
          chrec_id: response.data.data.chrec_id,
          pat_id: submittedData.pat_id,
          chhist_id: response.data.data.chhist_id,
          chvital_id: response.data.data.chvital_id,
          followv_id: response.data.data.followv_id,
        },
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to update child health record:", error);

    // Handle different types of errors
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(`Failed to update child health record: ${error.message}`);
    } else {
      throw new Error("Failed to update child health record: Unknown error occurred");
    }
  }
}

export function validateChildHealthFormData(formData: FormData): string[] {
  const errors: string[] = [];

  // Required field validations
  if (!formData.pat_id) {
    errors.push("Patient ID is required");
  }

  if (formData.residenceType === "Transient" && !formData.trans_id) {
    errors.push("Transient ID is required for transient residents");
  }

  // Validate vital signs if present
  if (formData.vitalSigns && formData.vitalSigns.length > 0) {
    formData.vitalSigns.forEach((vital, index) => {
      if (vital.date && !vital.temp && !vital.ht && !vital.wt) {
        errors.push(`Vital signs ${index + 1}: At least one measurement is required when date is provided`);
      }

      // Validate numeric values
      if (vital.ht && isNaN(Number(vital.ht))) {
        errors.push(`Vital signs ${index + 1}: Height must be a valid number`);
      }
      if (vital.wt && isNaN(Number(vital.wt))) {
        errors.push(`Vital signs ${index + 1}: Weight must be a valid number`);
      }
      if (vital.temp && isNaN(Number(vital.temp))) {
        errors.push(`Vital signs ${index + 1}: Temperature must be a valid number`);
      }
    });
  }

  // Validate medicines if present
  if (formData.medicines && formData.medicines.length > 0) {
    formData.medicines.forEach((med, index) => {
      if (!med.minv_id) {
        errors.push(`Medicine ${index + 1}: Inventory ID is required`);
      }
      if (!med.medrec_qty || med.medrec_qty <= 0) {
        errors.push(`Medicine ${index + 1}: Quantity must be greater than 0`);
      }
      if (isNaN(Number(med.medrec_qty))) {
        errors.push(`Medicine ${index + 1}: Quantity must be a valid number`);
      }
    });
  }

  // Validate nutritional status if present
  if (formData.nutritionalStatus) {
    if (formData.nutritionalStatus.muac && isNaN(Number(formData.nutritionalStatus.muac))) {
      errors.push("MUAC must be a valid number");
    }
  }

  return errors;
}

/**
 * Enhanced mutation hook with validation
 */
export const useUpdateChildHealthRecordMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: AddRecordArgs) => {
      // Validate before submission
      const validationErrors = validateChildHealthFormData(args.submittedData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return updateChildHealthRecord(args);
    },
    onSuccess: (data) => {
      // Comprehensive query invalidation
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory", data.data.chrec_id] });
      queryClient.invalidateQueries({ queryKey: ["ChildHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory"] });
      queryClient.invalidateQueries({ queryKey: ["nextufc"] });
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["followupVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["followupChildHealth", data.data.patrec_id] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["forwardedChildHealthHistoryRecord"] });
      queryClient.invalidateQueries({ queryKey: ["patients5yearsbelow"] });

      showSuccessToast("submitted successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Child health record update mutation with validation failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while updating child health record";

      showErrorToast(`Operation Failed: ${errorMessage}`);
    },
  });
};