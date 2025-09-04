// src/services/childHealthAPI.ts
import {
  createFollowUpVisit,
  createBodyMeasurement,
  createPatientDisability,
  createChildHealthNotes,
  createChildVitalSign,
  createNutritionalStatus,
  createExclusiveBFCheck,
  createSupplementStatus,
  createChildHealthHistory,
  processMedicineRequest
} from "./createAPI";
import { updateSupplementStatus, updateCHHistory,updateChildHealthNotes } from "./updateAPI";
import { AddRecordArgs } from "../muti-step-form/types";
import { useQueryClient } from "@tanstack/react-query";
import { createVitalSigns } from "@/pages/healthServices/vaccination/restful-api/post";

export async function updateChildHealthRecord({
  submittedData,
  staff,
  todaysHistoricalRecord,
  originalRecord,
  originalDisabilityRecords, // Pass the original disability records
}: AddRecordArgs): Promise<any> {
  const originalChrecDetails = originalRecord?.chrec_details || {};
  const originalPatrecDetails = originalChrecDetails?.patrec_details || {};
  const old_chhist = originalRecord?.chhist_id;
  const old_chrec_id = originalChrecDetails.chrec_id;
  const old_patrec_id = originalPatrecDetails.patrec_id;
  const chnotes_id = todaysHistoricalRecord?.chnotes_id;
  console.log("Original Record Details:", originalRecord);
  console.log("SBackend:", submittedData);
  console.log("chnotes_id:", chnotes_id);

  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }
  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

  // Declare variables that will be returned
  const patrec_id = old_patrec_id;
  const chrec_id = old_chrec_id;
  let current_chhist_id = old_chhist;
  let chvital_id: string | undefined;
  let followv_id: string | null = null;
  let bmi_id: string | undefined;

  if (
    submittedData.created_at &&
    new Date(submittedData.created_at).toDateString() ===
      new Date().toDateString()
  ) {
    if (
      submittedData.vitalSigns?.[0] &&
      new Date(submittedData.created_at).toDateString() ===
        new Date().toDateString()
    ) {
      const submittedVitalSign = submittedData.vitalSigns[0];
      const originalFollowvId = todaysHistoricalRecord?.followv_id;
      const submittedFollowUpDate = submittedVitalSign.followUpVisit;
      const submittedFollowUpDescription =
        submittedVitalSign.follov_description;
      const isFollowUpDataPresentInForm =
        submittedFollowUpDate || submittedFollowUpDescription;
      const originalNotes = todaysHistoricalRecord?.notes;
      const submittedNotes = submittedVitalSign.notes;

      if (!originalFollowvId && isFollowUpDataPresentInForm && !chnotes_id) {
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

        await createChildHealthNotes({
          chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          followv: followv_id,
          chhist: current_chhist_id,
          staff: staff || null,
        });
      } else {
        if (submittedNotes !== originalNotes) {
          await updateChildHealthNotes(
            chnotes_id,
            {
              chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
              staff: staff || null,
            }
          );
        }
        
      }

      await updateCHHistory({
        chhist_id: current_chhist_id,
        status: submittedData.status,
      });
      // Handle breastfeeding dates
      if (submittedData.BFdates && submittedData.BFdates.length > 0) {
        for (const date of submittedData.BFdates) {
          await createExclusiveBFCheck({
            chhist: current_chhist_id,
            BFdates: submittedData.BFdates,
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
          staff || null,
          current_chhist_id
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

    // Add new disabilities
    if (disabilitiesToAdd.length > 0) {
      await createPatientDisability({
        patrec: patrec_id,
        disabilities: submittedData.disabilityTypes?.map(String) || [],
      });
    }

    // Handle historical supplement statuses updates
    if (submittedData.historicalSupplementStatuses?.length) {
      // Get the original supplement statuses from the original record
      const originalStatuses = originalRecord?.supplements_statuses || [];

      // Transform the submitted data into the required update format
      const updates = submittedData.historicalSupplementStatuses
        .filter(
          (
            status
          ): status is {
            chssupplementstat_id: number;
            date_completed?: string | null;
          } => Boolean(status.chssupplementstat_id)
        )
        .map((status) => {
          // Find the original status to compare
          const originalStatus = originalStatuses.find(
            (s: any) => s.chssupplementstat_id === status.chssupplementstat_id
          );
          console.log("Original status:", originalStatus);
          console.log("Submitted status:", status);
          console.log(
            "Date completed comparison:",
            originalStatus?.date_completed,
            "vs",
            status.date_completed
          );
          console.log(
            "Has changed:",
            originalStatus?.date_completed !== status.date_completed
          );

          const isNewRecord = !originalStatus;
          const hasChangedDateCompleted =
            originalStatus?.date_completed !== status.date_completed &&
            !(
              originalStatus?.date_completed == null &&
              status.date_completed == null
            );

          return isNewRecord || hasChangedDateCompleted
            ? {
                chssupplementstat_id: status.chssupplementstat_id,
                date_completed: status.date_completed || null,
              }
            : null;
        })
        .filter(
          (
            update
          ): update is {
            chssupplementstat_id: number;
            date_completed: string | null;
            date_given_iron: string | null;
          } => update !== null
        );

      if (updates.length > 0) {
        try {
          await updateSupplementStatus(updates);
          console.log(
            `Successfully updated ${updates.length} supplement status records`
          );
        } catch (error) {
          console.error("Supplement status update failed:", error);
          throw new Error(
            `Failed to update supplement statuses: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      } else {
        console.log("No supplement status changes detected, skipping update");
      }
    }
  }

  // ==============================================================//
  else {
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
      staff: staff,
    });
    newNotes.chnotes_id;


    if (submittedData.vitalSigns?.length === 1) {
      const vital = submittedData.vitalSigns[0];
      console.log("Recorded OPT TRACKING")
      if (!vital.chvital_id && vital.date && submittedData.nutritionalStatus) {
     
    // Create body measurements
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
      pat:submittedData.pat_id,
      remarks:submittedData.vitalSigns?.[0]?.remarks || "",
      is_opt:submittedData.vitalSigns?.[0]?.is_opt || false,
      patrec: patrec_id,
      staff: staff,
    });
     bmi_id = newBMI.bm_id;
      }

    }

    const vitalsigns = await createVitalSigns({
      vital_temp: submittedData.vitalSigns?.[0]?.temp || "",
      staff: staff || null,
      patrec: patrec_id,
    });
    const vital_id = vitalsigns.vital_id;

    console.log("Vital signs created:", vitalsigns);
    // Create vital signs
    const newVitalSign = await createChildVitalSign({
      vital: vital_id,
      bm: bmi_id,
      chhist: current_chhist_id,

    });
    chvital_id = newVitalSign.chvital_id;

    // Assuming submittedData.vitalSigns is an array of VitalSignType objects
    // and VitalSignType includes an optional 'id' or 'chvital_id' for existing records
    // if (submittedData.vitalSigns?.length === 1 && submittedData.vitalSigns?.[0]?.is_opt == true) {
    //   const vital = submittedData.vitalSigns[0];
    //   console.log("Recorded OPT TRACKING")
    //   if (!vital.chvital_id && vital.date && submittedData.nutritionalStatus) {
    //     await createNutritionalStatus({
    //       wfa: submittedData.nutritionalStatus.wfa || "",
    //       lhfa: submittedData.nutritionalStatus.lhfa || "",
    //       wfl: submittedData.nutritionalStatus.wfh || "",
    //       muac: submittedData.nutritionalStatus.muac?.toString() || "",
    //       muac_status: submittedData.nutritionalStatus.muac_status || "",
    //       created_at: vital.date, // Use the vital sign's date
    //       chvital: Number(chvital_id), // Link to the vital sign's ID
    //       edemaSeverity: submittedData.edemaSeverity || "none",
    //       bm: bmi_id,
    //       pat:submittedData.pat_id,
    //       remarks:submittedData.vitalSigns?.[0]?.remarks || "",
    //       is_opt:submittedData.vitalSigns?.[0]?.is_opt || false,

    //     });
    //   }
    // }

    // Handle breastfeeding dates
    if (submittedData.BFdates && submittedData.BFdates.length > 0) {
      for (const date of submittedData.BFdates) {
        await createExclusiveBFCheck({
          chhist: current_chhist_id,
          BFdates: submittedData.BFdates,
        });
      }
    }

    const currentDisabilityIds = submittedData.disabilityTypes || [];
    const originalActiveDisabilityIds = originalDisabilityRecords
      .filter((d) => d.status === "active")
      .map((d) => d.id);

    const disabilitiesToAdd = currentDisabilityIds.filter(
      (id) => !originalActiveDisabilityIds.includes(id)
    );

    // Add new disabilities
    if (disabilitiesToAdd.length > 0) {
      await createPatientDisability({
        patrec: patrec_id,
        disabilities: submittedData.disabilityTypes?.map(String) || [],
      });
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
        staff || null,
        current_chhist_id
      );
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
        updated_at: new Date().toISOString(),
      });
    }

    // Handle historical supplement statuses updates
    if (submittedData.historicalSupplementStatuses?.length) {
      // Get the original supplement statuses from the original record
      const originalStatuses = originalRecord?.supplements_statuses || [];

      // Transform the submitted data into the required update format
      const updates = submittedData.historicalSupplementStatuses
        .filter(
          (
            status
          ): status is {
            chssupplementstat_id: number;
            date_completed?: string | null;
          } => Boolean(status.chssupplementstat_id)
        )
        .map((status) => {
          // Find the original status to compare
          const originalStatus = originalStatuses.find(
            (s: any) => s.chssupplementstat_id === status.chssupplementstat_id
          );

          // Only include if:
          // 1. This is a new record (no original status) OR
          // 2. date_completed or date_given_iron has changed from original
          const isNewRecord = !originalStatus;
          const hasChangedDateCompleted =
            originalStatus?.date_completed !== status.date_completed &&
            !(
              originalStatus?.date_completed == null &&
              status.date_completed == null
            );
          return isNewRecord || hasChangedDateCompleted
            ? {
                chssupplementstat_id: status.chssupplementstat_id,
                date_completed: status.date_completed || null,
              }
            : null;
        })
        .filter(
          (
            update
          ): update is {
            chssupplementstat_id: number;
            date_completed: string | null;
          } => update !== null
        );

      if (updates.length > 0) {
        try {
          await updateSupplementStatus(updates);
          console.log(
            `Successfully updated ${updates.length} supplement status records`
          );
        } catch (error) {
          console.error("Supplement status update failed:", error);
          throw new Error(
            `Failed to update supplement statuses: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      } else {
        console.log("No supplement status changes detected, skipping update");
      }
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

export const useUpdateChildHealthRecordMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChildHealthRecord,
    onSuccess: (data) => {
      const { chrec_id } = data;
      console.log("Child health record updated successfully result :", data);
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] });
      queryClient.invalidateQueries({
        queryKey: ["childHealthHistory", chrec_id],
      });
      toast.success("Child health record created successfully!");
      navigate(-1);
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
