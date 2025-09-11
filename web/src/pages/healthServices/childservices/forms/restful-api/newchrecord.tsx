// src/services/childHealthAPI.ts
import { createFollowUpVisit, createBodyMeasurement, createChildHealthNotes, createChildVitalSign, createSupplementStatus, createExclusiveBFCheck, createChildHealthRecord, createChildHealthHistory, processMedicineRequest } from "./createAPI";
import { updateSupplementStatus, updateCHHistory, updateChildHealthNotes } from "./updateAPI";
import { createVitalSigns } from "@/pages/healthServices/vaccination/restful-api/post";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
import { api2 } from "@/api/api";
import { useQueryClient } from "@tanstack/react-query";

export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord?: any; // Add this parameter for existing records check
  originalRecord?: any; // Add this parameter for original record data
}

export interface AddRecordResult {
  patrec_id: string;
  chrec_id: string;
  chhist_id: string;
  chvital_id?: string;
  followv_id?: string | null;
}

export async function addChildHealthRecord({ submittedData, staff, todaysHistoricalRecord, originalRecord }: AddRecordArgs): Promise<AddRecordResult> {
  // Validate required fields
  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }
  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  // Check if we're updating an existing record from today
  const isTodayRecord = submittedData.created_at && new Date(submittedData.created_at).toDateString() === new Date().toDateString() && todaysHistoricalRecord && originalRecord;

  // Transient update handling
  if (submittedData.residenceType === "Transient") {
    try {
      const transRes = await api2.patch(`patientrecords/update-transient/${submittedData.trans_id}/`, {
        mother_fname: submittedData.motherFname || null,
        mother_lname: submittedData.motherLname || null,
        mother_mname: submittedData.motherMname || null,
        mother_age: submittedData.motherAge || null,
        mother_dob: submittedData.motherdob || null,
        father_fname: submittedData.fatherFname || null,
        father_lname: submittedData.fatherLname || null,
        father_mname: submittedData.fatherMname || null,
        father_age: submittedData.fatherAge || null,
        father_dob: submittedData.fatherdob || null
      });
      if (transRes.status !== 200) {
        throw new Error("Failed to update transient information");
      }
      console.log("Transient updated successfully:", transRes.data);
    } catch (transientError) {
      console.error("Transient update error:", transientError);
      if (transientError instanceof Error) {
        throw new Error(`Failed to update transient: ${transientError.message}`);
      } else {
        throw new Error("Failed to update transient: Unknown error");
      }
    }
  }

  let patrec_id: string;
  let chrec_id: string;
  let current_chhist_id: string;

  if (isTodayRecord) {
    // Use existing IDs for today's record update
    patrec_id = originalRecord?.chrec_details?.patrec_details?.patrec_id;
    chrec_id = originalRecord?.chrec_details?.chrec_id;
    current_chhist_id = todaysHistoricalRecord?.chhist_id;

    const chnotes_id = todaysHistoricalRecord?.chnotes_id;

    // Handle follow-up visit updates
    if (submittedData.vitalSigns?.[0]) {
      const submittedVitalSign = submittedData.vitalSigns[0];
      const originalFollowvId = todaysHistoricalRecord?.followv_id;
      const submittedFollowUpDate = submittedVitalSign.followUpVisit;
      const submittedFollowUpDescription = submittedVitalSign.follov_description;
      const isFollowUpDataPresentInForm = submittedFollowUpDate || submittedFollowUpDescription;
      const originalNotes = todaysHistoricalRecord?.notes;
      const submittedNotes = submittedVitalSign.notes;

      if (!originalFollowvId && isFollowUpDataPresentInForm && !chnotes_id) {
        const newFollowUp = await createFollowUpVisit({
          followv_date: submittedData.vitalSigns[0].followUpVisit || null,
          created_at: new Date().toISOString(),
          followv_description: submittedData.vitalSigns[0].follov_description || "Follow Up for Child Health",
          patrec: patrec_id,
          followv_status: "pending",
          updated_at: new Date().toISOString()
        });
        const followv_id = newFollowUp.followv_id;

        if (submittedData.vitalSigns?.[0]?.notes) {
          await createChildHealthNotes({
            chn_notes: submittedData.vitalSigns[0].notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            followv: followv_id,
            chhist: current_chhist_id,
            staff: staff || null
          });
        }
      } else {
        if (submittedNotes !== originalNotes && chnotes_id) {
          await updateChildHealthNotes(chnotes_id, {
            chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
            staff: staff || null
          });
        }
      }

      await updateCHHistory({
        chhist_id: current_chhist_id,
        status: submittedData.status
      });
    }

    // Handle breastfeeding dates
    if (submittedData.BFdates && submittedData.BFdates.length > 0) {
      for (const date of submittedData.BFdates) {
        await createExclusiveBFCheck({
          chhist: current_chhist_id,
          BFdates: [date]
        });
      }
    }

    // Handle medicines
    if (submittedData.medicines && submittedData.medicines.length > 0) {
      await processMedicineRequest({
        pat_id: submittedData.pat_id,
        medicines: submittedData.medicines.map((med) => ({
          minv_id: med.minv_id,
          medrec_qty: med.medrec_qty,
          reason: med.reason || ""
        })),
        staff_id: staff || null,
        chhist_id: current_chhist_id
      });
    }

    // Handle historical supplement statuses updates
    if (submittedData.historicalSupplementStatuses?.length) {
      const originalStatuses = originalRecord?.supplements_statuses || [];
      const updates = submittedData.historicalSupplementStatuses
        .filter((status): status is { chssupplementstat_id: number; date_completed?: string | null } => Boolean(status.chssupplementstat_id))
        .map((status) => {
          const originalStatus = originalStatuses.find((s: any) => s.chssupplementstat_id === status.chssupplementstat_id);
          const isNewRecord = !originalStatus;
          const hasChangedDateCompleted = originalStatus?.date_completed !== status.date_completed && !(originalStatus?.date_completed == null && status.date_completed == null);

          return isNewRecord || hasChangedDateCompleted
            ? {
                chssupplementstat_id: status.chssupplementstat_id,
                date_completed: status.date_completed || null
              }
            : null;
        })
        .filter((update): update is { chssupplementstat_id: number; date_completed: string | null } => update !== null);

      if (updates.length > 0) {
        try {
          await updateSupplementStatus(updates);
          console.log(`Successfully updated ${updates.length} supplement status records`);
        } catch (error) {
          console.error("Supplement status update failed:", error);
          throw new Error(`Failed to update supplement statuses: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
    }

    return {
      patrec_id,
      chrec_id,
      chhist_id: current_chhist_id,
      chvital_id: todaysHistoricalRecord?.chvital_id,
      followv_id: todaysHistoricalRecord?.followv_id
    };
  } else {
    // Create new patient record (original logic for new records)
    const newPatrec = await createPatientRecord({
      pat_id: submittedData.pat_id,
      patrec_type: "Child Health Record",
      staff: staff
    });

    patrec_id = newPatrec.patrec_id;
    const newChrec = await createChildHealthRecord({
      ufc_no: submittedData.ufcNo || "",
      family_no: submittedData.familyNo || "",
      place_of_delivery_type: submittedData.placeOfDeliveryType,
      pod_location: submittedData.placeOfDeliveryLocation || "",
      mother_occupation: submittedData.motherOccupation || "",
      type_of_feeding: submittedData.type_of_feeding,
      father_occupation: submittedData.fatherOccupation || "",
      birth_order: submittedData.birth_order,
      newborn_screening: submittedData.dateNewbornScreening || "",
      staff: staff,
      patrec: patrec_id,
      landmarks: submittedData.landmarks || null
    });

    chrec_id = newChrec.chrec_id;

    // Create child health history
    const newChhist = await createChildHealthHistory({
      created_at: new Date().toISOString(),
      chrec: chrec_id,
      status: submittedData.status || "recorded",
      tt_status: submittedData.tt_status
    });
    current_chhist_id = newChhist.chhist_id;

    // Handle follow-up visit if needed
    let followv_id = null;
    if (submittedData.vitalSigns?.[0]?.followUpVisit) {
      const newFollowUp = await createFollowUpVisit({
        followv_date: submittedData.vitalSigns[0].followUpVisit,
        created_at: new Date().toISOString(),
        followv_description: submittedData.vitalSigns[0].follov_description || "Follow Up for Child Health",
        patrec: patrec_id,
        followv_status: "pending",
        updated_at: new Date().toISOString()
      });
      followv_id = newFollowUp.followv_id;
    }

    // Create health notes if there are notes added
    if (submittedData.vitalSigns?.[0]?.notes) {
      await createChildHealthNotes({
        chn_notes: submittedData.vitalSigns[0].notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        followv: followv_id,
        chhist: current_chhist_id,
        staff: staff || null
      });
    }

    let bmi_id = null;
    // Create body measurements
    if (submittedData.vitalSigns?.length === 1) {
      const vital = submittedData.vitalSigns[0];
      if (!vital.chvital_id && vital.date && submittedData.nutritionalStatus) {
        const newBMI = await createBodyMeasurement({
          age: submittedData.childAge,
          height: submittedData.vitalSigns?.[0]?.ht || null,
          weight: submittedData.vitalSigns?.[0]?.wt || null,
          wfa: submittedData.nutritionalStatus.wfa || "",
          lhfa: submittedData.nutritionalStatus.lhfa || "",
          wfl: submittedData.nutritionalStatus.wfh || "",
          muac: submittedData.nutritionalStatus.muac?.toString() || "",
          muac_status: submittedData.nutritionalStatus.muac_status || "",
          edemaSeverity: submittedData.edemaSeverity || "none",
          pat: submittedData.pat_id,
          remarks: submittedData.vitalSigns?.[0]?.remarks || "",
          is_opt: submittedData.vitalSigns?.[0]?.is_opt || false,
          patrec: patrec_id,
          staff: staff
        });
        bmi_id = newBMI.bm_id;
      }
    }

    const vitalsigns = await createVitalSigns({
      vital_temp: submittedData.vitalSigns?.[0]?.temp || "",
      staff: staff || null,
      patrec: patrec_id
    });
    const vital_id = vitalsigns.vital_id;

    // Create vital signs
    const newVitalSign = await createChildVitalSign({
      vital: vital_id,
      bm: bmi_id,
      chhist: current_chhist_id,
      created_at: new Date().toISOString()
    });
    const chvital_id = newVitalSign.chvital_id;

    if (submittedData.BFdates && submittedData.BFdates.length > 0) {
      for (const date of submittedData.BFdates) {
        await createExclusiveBFCheck({
          chhist: current_chhist_id,
          BFdates: [date]
        });
      }
    }

    // Handle low birth weight
    const isLowBirthWeight = submittedData.vitalSigns?.[0]?.wt && Number.parseFloat(String(submittedData.vitalSigns[0].wt)) < 2.5;
    if (isLowBirthWeight && (submittedData.birthwt?.seen || submittedData.birthwt?.given_iron)) {
      await createSupplementStatus({
        status_type: "birthwt",
        date_seen: submittedData.birthwt?.seen || null,
        date_given_iron: submittedData.birthwt?.given_iron || null,
        chhist: current_chhist_id,
        created_at: new Date().toISOString(),
        birthwt: Number(submittedData.vitalSigns?.[0]?.wt),
        date_completed: null
      });
    }

    // Handle anemia
    if (submittedData.anemic?.is_anemic == true) {
      await createSupplementStatus({
        status_type: "anemic",
        date_seen: submittedData.anemic?.seen || null,
        date_given_iron: submittedData.anemic?.given_iron || null,
        chhist: current_chhist_id,
        created_at: new Date().toISOString(),
        birthwt: Number(submittedData.vitalSigns?.[0]?.wt),
        date_completed: null,
        updated_at: new Date().toISOString()
      });
    }

    if (submittedData.medicines && submittedData.medicines.length > 0) {
      await processMedicineRequest({
        pat_id: submittedData.pat_id,
        medicines: submittedData.medicines.map((med) => ({
          minv_id: med.minv_id,
          medrec_qty: Number(med.medrec_qty),
          reason: med.reason || ""
        })),
        staff_id: staff || undefined,
        chhist_id: current_chhist_id
      });
    }

    return {
      patrec_id,
      chrec_id,
      chhist_id: current_chhist_id,
      chvital_id,
      followv_id
    };
  }
}

import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useChildHealthRecordMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChildHealthRecord,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({ queryKey: ["childHealthHistory", data.chrec_id] });
      toast.success("Child health record created successfully!");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Failed to create child health record:", error);
      toast.error(`Operation Failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });
};
