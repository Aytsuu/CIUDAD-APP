// src/services/childHealthAPI.ts - Simplified version using single API call

import { api2 } from "@/api/api";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord?: any;
  originalRecord?: any;
}

export interface AddRecordResult {
  success: boolean;
  message: string;
  patrec_id: string;
  chrec_id: string;
  chhist_id: string;
  chvital_id?: string;
  followv_id?: string | null;
}

/**
 * Simplified function that sends all child health record data to a single comprehensive API endpoint
 * This replaces all the individual API calls with one atomic operation
 */
export async function addChildHealthRecord({ submittedData, staff, todaysHistoricalRecord, originalRecord }: AddRecordArgs): Promise<AddRecordResult> {
  // Basic validation on frontend
  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }

  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  try {
    console.log("Sending comprehensive child health data to single API endpoint...");

    // Transform the data to match what the backend expects
    const requestData = {
      submittedData: {
        // Patient info
        pat_id: submittedData.pat_id,
        trans_id: submittedData.trans_id,
        residenceType: submittedData.residenceType,

        // Child health record fields
        ufcNo: submittedData.ufcNo,
        familyNo: submittedData.familyNo,
        placeOfDeliveryType: submittedData.placeOfDeliveryType,
        placeOfDeliveryLocation: submittedData.placeOfDeliveryLocation,
        motherOccupation: submittedData.motherOccupation,
        type_of_feeding: submittedData.type_of_feeding,
        fatherOccupation: submittedData.fatherOccupation,
        birth_order: submittedData.birth_order,
        dateNewbornScreening: submittedData.dateNewbornScreening,
        landmarks: submittedData.landmarks,

        // Child health history
        status: submittedData.status,
        tt_status: submittedData.tt_status,
        created_at: submittedData.created_at,

        // Vital signs and measurements
        vitalSigns: submittedData.vitalSigns,
        nutritionalStatus: submittedData.nutritionalStatus,
        childAge: submittedData.childAge,
        edemaSeverity: submittedData.edemaSeverity,

        // Breastfeeding dates
        BFchecks: submittedData.BFchecks,
        // Medicines
        medicines: submittedData.medicines,

        // Supplement statuses
        historicalSupplementStatuses: submittedData.historicalSupplementStatuses,
        birthwt: submittedData.birthwt,
        anemic: submittedData.anemic,

        // Transient parent information
        motherFname: submittedData.motherFname,
        motherLname: submittedData.motherLname,
        motherMname: submittedData.motherMname,
        motherAge: submittedData.motherAge,
        motherdob: submittedData.motherdob,
        fatherFname: submittedData.fatherFname,
        fatherLname: submittedData.fatherLname,
        fatherMname: submittedData.fatherMname,
        fatherAge: submittedData.fatherAge,
        fatherdob: submittedData.fatherdob
      },
      staff: staff,
      todaysHistoricalRecord: todaysHistoricalRecord,
      originalRecord: originalRecord
    };

    console.log("Request payload:", {
      pat_id: requestData.submittedData.pat_id,
      residenceType: requestData.submittedData.residenceType,
      hasVitalSigns: !!requestData.submittedData.vitalSigns?.length,
      hasMedicines: !!requestData.submittedData.medicines?.length,
      hasBFdates: !!requestData.submittedData.BFdates?.length,
      isUpdate: !!todaysHistoricalRecord
    });

    // Make single API call to comprehensive endpoint
    const response = await api2.post("child-health/create-new-record/", requestData);

    if (response.status === 200 || response.status === 201) {
      console.log("Child health record processed successfully:", response.data);
      return {
        success: response.data.success,
        message: response.data.message,
        patrec_id: response.data.patrec_id,
        chrec_id: response.data.chrec_id,
        chhist_id: response.data.chhist_id,
        chvital_id: response.data.chvital_id,
        followv_id: response.data.followv_id
      };
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error: any) {
    console.error("Failed to process child health record:", error);

    // Handle different types of errors
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(`Failed to process child health record: ${error.message}`);
    } else {
      throw new Error("Failed to process child health record: Unknown error occurred");
    }
  }
}

/**
 * React Query mutation hook for child health records
 * This remains the same but now uses the simplified single API call
 */
export const useChildHealthRecordMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChildHealthRecord,
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory", data.chrec_id] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      queryClient.invalidateQueries({ queryKey: ["medicineInventory"] });

      // Show success message
      toast.success(data.message || "Child health record processed successfully!");

      // Navigate back
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Child health record mutation failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while processing child health record";

      toast.error(`Operation Failed: ${errorMessage}`);
    }
  });
};

/**
 * Optional: Helper function to validate form data before submission
 */
export function validateChildHealthFormData(formData: FormData): string[] {
  const errors: string[] = [];

  // Required field validations
  if (!formData.pat_id) {
    errors.push("Patient ID is required");
  }

  if (formData.residenceType === "Transient" && !formData.trans_id) {
    errors.push("Transient ID is required for transient residents");
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
    });
  }

  // Validate vital signs if present
  if (formData.vitalSigns && formData.vitalSigns.length > 0) {
    formData.vitalSigns.forEach((vital, index) => {
      if (vital.date && !vital.temp && !vital.ht && !vital.wt) {
        errors.push(`Vital signs ${index + 1}: At least one measurement is required when date is provided`);
      }
    });
  }

  return errors;
}

/**
 * Enhanced mutation hook with validation
 */
export const useChildHealthRecordMutationWithValidation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: AddRecordArgs) => {
      // Validate before submission
      const validationErrors = validateChildHealthFormData(args.submittedData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }

      return addChildHealthRecord(args);
    },
    onSuccess: (data) => {
      // Comprehensive query invalidation
      const queriesToInvalidate = [["childHealthRecords"], ["childHealthHistory", data.chrec_id], ["patientRecords"], ["medicineInventory"], ["medicineRecords"], ["followUpVisits"], ["bodyMeasurements"], ["vitalSigns"]];

      queriesToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });

      toast.success(data.message || "Child health record processed successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Child health record mutation with validation failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while processing child health record";

      toast.error(`Operation Failed: ${errorMessage}`);
    }
  });
};
