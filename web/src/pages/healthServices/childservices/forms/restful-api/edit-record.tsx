// src/services/childHealthAPI.ts
import {
  createFollowUpVisit,
  createBodyMeasurement,
  createPatientDisability,
  updateFollowUpVisit,
  updatePatientDisabilityStatus,
  deleteFollowUpVisit,
} from "./patient-info";
import {
  createExclusiveBFCheck,
  createSupplementStatus,
  createChildHealthRecord,
  createChildHealthHistory,
} from "./chrecord";
import {
  createChildHealthNotes,
  createChildVitalSign,
  createNutritionalStatus,
  updateChildHealthNotes,
} from "./vitalsignsAPI";
import { processMedicineRequest } from "@/pages/healthServices/medicineservices/queries/processSubmit";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";
import { isToday } from "../editform/child-health-record-form";

export interface AddRecordArgs {
  submittedData: FormData;
  staff: string | null;
  todaysHistoricalRecord: any;
  originalRecord: any;
  originalDisabilityRecords: { id: number; pd_id: string; status: string }[];
}

export interface AddRecordResult {
  patrec_id: string;
  chrec_id: string;
  chhist_id: string;
  chvital_id?: string;
  followv_id?: string | null;
}

export async function updateChildHealthRecord({
  submittedData,
  staff,
  todaysHistoricalRecord,
  originalRecord,
  originalDisabilityRecords, // Pass the original disability records
}: AddRecordArgs): Promise<AddRecordResult> {
  const originalChrecDetails = originalRecord?.chrec_details || {};
  const originalPatrecDetails = originalChrecDetails?.patrec_details || {};
  const old_chhist = originalRecord?.chhist_id;
  const old_chrec_id = originalChrecDetails.chrec_id;
  const old_patrec_id = originalPatrecDetails.patrec_id;

  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }
  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  // Declare variables that will be returned
  let patrec_id = old_patrec_id;
  let chrec_id = old_chrec_id;
  let current_chhist_id = old_chhist;
  let chvital_id: string | undefined;
  let followv_id: string | null = null;

  if (
    submittedData.created_at &&
    new Date(submittedData.created_at).toDateString() ===
      new Date().toDateString()
  ) {
    if (
      submittedData.vitalSigns?.[0] &&
      new Date(submittedData.created_at).toDateString() ===
      new Date().toDateString()    ) {
      const submittedVitalSign = submittedData.vitalSigns[0];
      const originalFollowvId = todaysHistoricalRecord?.followv_id;
      const submittedFollowUpDate = submittedVitalSign.followUpVisit;
      const submittedFollowUpDescription =
        submittedVitalSign.follov_description;
      const originalFollowUpDate = todaysHistoricalRecord?.followUpVisit;
      const originalFollowUpDescription =
        todaysHistoricalRecord?.follov_description;
      const isFollowUpDataPresentInForm =
        submittedFollowUpDate || submittedFollowUpDescription;


      const originalNotes = todaysHistoricalRecord?.notes;
      const submittedNotes = submittedVitalSign.notes;
      const originalChnotesId = todaysHistoricalRecord?.chnotes_id;

      if (!originalFollowvId && isFollowUpDataPresentInForm) {
        const newFollowUp = await createFollowUpVisit({
          followv_date: submittedData.vitalSigns[0].followUpVisit || null,
          created_at: new Date().toISOString(),
          followv_description:
        submittedData.vitalSigns[0].follov_description ||
        "Follow Up for Child Health",
          patrec: old_patrec_id,
          followv_status: "pending",
          updated_at: new Date().toISOString(),
        });
        followv_id = newFollowUp.followv_id;

        const newNotes = await createChildHealthNotes({
          chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          followv: followv_id,
          chhist: current_chhist_id,
          staff: staff || null,
        });
      }else{
        if(submittedNotes !== originalNotes) {
          const newNotes = await createChildHealthNotes({
            chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            followv: originalFollowvId,
            chhist: current_chhist_id,
            staff: staff || null,
          });
        }
      }
      //   const newFollowUp = await createFollowUpVisit({
      //     followv_date: submittedData.vitalSigns[0].followUpVisit || null,
      //     created_at: new Date().toISOString(),
      //     followv_description:
      //       submittedData.vitalSigns[0].follov_description ||
      //       "Follow Up for Child Health",
      //     patrec: old_patrec_id,
      //     followv_status: "pending",
      //     updated_at: new Date().toISOString(),
      //   });
      //   followv_id = newFollowUp.followv_id;

      //   const newNotes = await createChildHealthNotes({
      //     chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
      //     created_at: new Date().toISOString(),
      //     updated_at: new Date().toISOString(),
      //     followv: followv_id,
      //     chhist: current_chhist_id,
      //     staff: staff || null,
      //   });
      // }else if (originalFollowvId && isFollowUpDataPresentInForm && originalNotes == submittedNotes) {

      

      
      // Handle breastfeeding dates
      if (submittedData.BFdates && submittedData.BFdates.length > 0) {
        for (const date of submittedData.BFdates) {
          await createExclusiveBFCheck({
            chhist: current_chhist_id,
            ebf_date: date,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Handle medicines
      if (submittedData.medicines && submittedData.medicines.length > 0) {
        await processMedicineRequest(
          {
            pat_id: submittedData.pat_id,
            medicines: submittedData.medicines.map((med) => ({
              minv_id: med.minv_id,
              medrec_qty: med.medrec_qty,
              reason: med.reason || "",
            })),
          },
          staff || null
        );
      }
    }



    const currentDisabilityIds = submittedData.disabilityTypes || [];
    const originalActiveDisabilityIds = originalDisabilityRecords
      .filter((d) => d.status === "active")
      .map((d) => d.id);

    const disabilitiesToAdd = currentDisabilityIds.filter(
      (id) => !originalActiveDisabilityIds.includes(id)
    );
    const disabilitiesToResolve = originalDisabilityRecords.filter(
      (originalDisability) =>
        originalDisability.status === "active" && // Only consider active ones for resolving
        !currentDisabilityIds.includes(Number(originalDisability.id))
    );

    // Add new disabilities
    if (disabilitiesToAdd.length > 0) {
      await createPatientDisability({
        patrec: patrec_id,
        disabilities: submittedData.disabilityTypes?.map(String) || [],
      });
    }

    // Resolve removed disabilities
    if (disabilitiesToResolve.length > 0) {
      if (disabilitiesToResolve.length > 0) {
        const updates = disabilitiesToResolve.map((obj) => ({
          id: obj.id, // make sure this is just the string id
          status: "resolve" as const,
        }));

        await updatePatientDisabilityStatus(updates);
      }
    }


    
  } else {
    const newChhist = await createChildHealthHistory({
      created_at: new Date().toISOString(),
      chrec: chrec_id,
      status: submittedData.status || "recorded",
      tt_status: submittedData.tt_status,
    });
    current_chhist_id = newChhist.chhist_id;

    // Handle follow-up visit if needed
    if (submittedData.vitalSigns?.[0]?.followUpVisit) {
      const newFollowUp = await createFollowUpVisit({
        followv_date: submittedData.vitalSigns[0].followUpVisit,
        created_at: new Date().toISOString(),
        followv_description:
          submittedData.vitalSigns[0].follov_description ||
          "Follow Up for Child Health",
        patrec: patrec_id,
        followv_status: "pending",
        updated_at: new Date().toISOString(),
      });
      followv_id = newFollowUp.followv_id;
    }

    // Create health notes
    const newNotes = await createChildHealthNotes({
      chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      followv: followv_id,
      chhist: current_chhist_id,
      staff: staff || null,
    });
    const chnotes_id = newNotes.chnotes_id;

    // Create body measurements
    const newBMI = await createBodyMeasurement({
      age: submittedData.childAge,
      height: submittedData.vitalSigns?.[0]?.ht || null,
      weight: submittedData.vitalSigns?.[0]?.wt || null,
      created_at: new Date().toISOString(),
      patrec: patrec_id,
      staff: staff || null,
    });
    const bmi_id = newBMI.bm_id;

    // Create vital signs
    const newVitalSign = await createChildVitalSign({
      temp: submittedData.vitalSigns?.[0]?.temp || null,
      bm: bmi_id,
      chhist: current_chhist_id,
      created_at: new Date().toISOString(),
    });
    chvital_id = newVitalSign.chvital_id;

    // Create nutritional status
    await createNutritionalStatus({
      wfa: submittedData.nutritionalStatus?.wfa || "",
      lhfa: submittedData.nutritionalStatus?.lhfa || "",
      wfl: submittedData.nutritionalStatus?.wfh || "",
      muac: submittedData.nutritionalStatus?.muac?.toString() || "",
      muac_status: submittedData.nutritionalStatus?.muac_status || "",
      created_at: new Date().toISOString(),
      chvital: Number(chvital_id),
      edemaSeverity: submittedData.edemaSeverity || "none",
    });

    // Handle breastfeeding dates
    if (submittedData.BFdates && submittedData.BFdates.length > 0) {
      for (const date of submittedData.BFdates) {
        await createExclusiveBFCheck({
          chhist: current_chhist_id,
          ebf_date: date,
          created_at: new Date().toISOString(),
        });
      }
    }

    // // Handle disabilities
    // if (
    //   submittedData.disabilityTypes &&
    //   submittedData.disabilityTypes.length > 0
    // ) {
    //   await createPatientDisability({
    //     patrec: patrec_id,
    //     disabilities: submittedData.disabilityTypes?.map(String) || [],
    //   });
    // }

    const currentDisabilityIds = submittedData.disabilityTypes || [];
    const originalActiveDisabilityIds = originalDisabilityRecords
      .filter((d) => d.status === "active")
      .map((d) => d.id);

    const disabilitiesToAdd = currentDisabilityIds.filter(
      (id) => !originalActiveDisabilityIds.includes(id)
    );
    const disabilitiesToResolve = originalDisabilityRecords.filter(
      (originalDisability) =>
        originalDisability.status === "active" && // Only consider active ones for resolving
        !currentDisabilityIds.includes(Number(originalDisability.id))
    );

    // Add new disabilities
    if (disabilitiesToAdd.length > 0) {
      await createPatientDisability({
        patrec: patrec_id,
        disabilities: submittedData.disabilityTypes?.map(String) || [],
      });
    }

    // Resolve removed disabilities
    if (disabilitiesToResolve.length > 0) {
      if (disabilitiesToResolve.length > 0) {
        const updates = disabilitiesToResolve.map((obj) => ({
          id: obj.id, // make sure this is just the string id
          status: "resolve" as const,
        }));

        await updatePatientDisabilityStatus(updates);
      }
    }

    // // Handle low birth weight
    const isLowBirthWeight =
      submittedData.vitalSigns?.[0]?.wt &&
      Number.parseFloat(String(submittedData.vitalSigns[0].wt)) < 2.5;
    if (
      isLowBirthWeight &&
      (submittedData.birthwt?.seen || submittedData.birthwt?.given_iron)
    ) {
      await createSupplementStatus({
        status_type: "birthwt",
        date_seen: submittedData.birthwt?.seen || null,
        date_given_iron: submittedData.birthwt?.given_iron || null,
        chhist: current_chhist_id,
        created_at: new Date().toISOString(),
        birthwt: Number(submittedData.vitalSigns?.[0]?.wt),
        date_completed: null,
      });
    }

    // Handle medicines
    if (submittedData.medicines && submittedData.medicines.length > 0) {
      await processMedicineRequest(
        {
          pat_id: submittedData.pat_id,
          medicines: submittedData.medicines.map((med) => ({
            minv_id: med.minv_id,
            medrec_qty: med.medrec_qty,
            reason: med.reason || "",
          })),
        },
        staff || null
      );
    }

    // Handle anemia
    if (submittedData.is_anemic) {
      await createSupplementStatus({
        status_type: "anemic",
        date_seen: submittedData.anemic?.seen || null,
        date_given_iron: submittedData.anemic?.given_iron || null,
        chhist: current_chhist_id,
        created_at: new Date().toISOString(),
        birthwt: Number(submittedData.vitalSigns?.[0]?.wt),
        date_completed: null,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return {
    patrec_id,
    chrec_id,
    chhist_id: current_chhist_id,
    chvital_id,
    followv_id,
  };
}

// src/hooks/useChildHealthRecordMutation.ts
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sub } from "date-fns";

export const useUpdateChildHealthRecordMutation = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: updateChildHealthRecord,
    onSuccess: () => {
      toast.success("Child health record updated successfully!");
    },
    onError: (error: unknown) => {
      console.error("Failed to update child health record:", error);
      toast.error(
        `Operation Failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    },
  });
};
