// src/services/childHealthAPI.ts - Simplified version using single API call

import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { localDateFormatter } from "@/helpers/localDateFormatter";

export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord?: any;
  originalRecord?: any;
}

/**
 * Simplified function that sends all child health record data to a single comprehensive API endpoint
 * This replaces all the individual API calls with one atomic operation
 */
export async function addChildHealthRecord({ submittedData, staff, todaysHistoricalRecord, originalRecord }: any): Promise<any> {
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
        ufc_no: submittedData.ufcNo,
        family_no: submittedData.familyNo,
        place_of_delivery_type: submittedData.placeOfDeliveryType,
        pod_location: submittedData.placeOfDeliveryLocation,
        mother_occupation: submittedData.motherOccupation,
        father_occupation: submittedData.fatherOccupation,
        birth_order: submittedData.birth_order,
        newborn_screening: localDateFormatter(submittedData.dateNewbornScreening),
        landmarks: submittedData.landmarks,
        nbscreening_result: submittedData.nbscreening_result,
        newbornInitiatedbf: submittedData.newbornInitiatedbf,
        selectedStaffId: submittedData.selectedStaffId,

        // Child health history
        status: submittedData.status,
        tt_status: submittedData.tt_status,

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
        mother_fname: submittedData.motherFname,
        mother_lname: submittedData.motherLname,
        mother_mname: submittedData.motherMname,
        mother_age: submittedData.motherAge,
        mother_dob: localDateFormatter(submittedData.motherdob),
        father_fname: submittedData.fatherFname,
        father_lname: submittedData.fatherLname,
        father_mname: submittedData.fatherMname,
        father_age: submittedData.fatherAge,
        father_dob: localDateFormatter(submittedData.fatherdob),
        passed_status: submittedData.passed_status || "recorded"
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
      hasBFdates: !!requestData.submittedData.BFchecks?.length,
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
        followv_id: response.data.followv_id,
        pat_id: requestData.submittedData.pat_id
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

export const useChildHealthRecordMutation = () => {
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
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory", data.chrec_id] });
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory"] });
      queryClient.invalidateQueries({ queryKey: ["nextufc"] });
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
      queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });
      queryClient.invalidateQueries({ queryKey: ["patientRecords"] });
      queryClient.invalidateQueries({ queryKey: ["patientVaccinationRecords"] });
      queryClient.invalidateQueries({ queryKey: ["followupVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["followupChildHealth", data.pat_id] });
      queryClient.invalidateQueries({ queryKey: ["unvaccinatedVaccines"] });
      queryClient.invalidateQueries({ queryKey: ["forwardedChildHealthHistoryRecord"] });

      showSuccessToast("submitted successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Child health record mutation with validation failed:", error);

      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred while processing child health record";

      showErrorToast(`Operation Failed: ${errorMessage}`);
    }
  });
};