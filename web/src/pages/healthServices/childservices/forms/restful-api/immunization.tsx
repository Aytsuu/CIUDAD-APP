// src/services/childHealthAPI.ts
import {
  createFollowUpVisit,
  createBodyMeasurement,
  createPatientDisability,
  createChildHealthNotes,
  createChildVitalSign,
  createNutritionalStatus,
} from "./createAPI";
import {
  createExclusiveBFCheck,
  createSupplementStatus,
  createChildHealthRecord,
  createChildHealthHistory,
} from "./chrecord";
import { deleteFollowUpVisit } from "./deleteAPI";
import { updateSupplementStatus, updateCHHistory } from "./updateAPI";
import { processMedicineRequest } from "./createAPI";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { AddRecordArgs, AddRecordResult } from "../muti-step-form/types";
import { useQueryClient } from "@tanstack/react-query";

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

  if (!submittedData.pat_id) {
    throw new Error("Patient ID is required");
  }
  if (submittedData.residenceType === "Transient" && !submittedData.trans_id) {
    throw new Error("Transient ID is required for transient residents");
  }

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

      await updateCHHistory(current_chhist_id);

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
      } else {
        if (submittedNotes !== originalNotes) {
          const newNotes = await createChildHealthNotes({
            chn_notes: submittedData.vitalSigns?.[0]?.notes || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            followv: originalFollowvId,
            chhist: current_chhist_id,
            staff: staff,
          });
        }
      }

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
          } => Boolean(status.chssupplementstat_id) // Ensure ID exists
        )
        .map((status) => {
          // Find the original status to compare
          const originalStatus = originalStatuses.find(
            (s: any) => s.chssupplementstat_id === status.chssupplementstat_id
          );

          // Only include if:
          // 1. This is a new record (no original status) OR
          // 2. date_completed has changed from original
          const isNewRecord = !originalStatus;
          const hasChangedDate =
            originalStatus?.date_completed !== status.date_completed;

          return isNewRecord || hasChangedDate
            ? {
                chssupplementstat_id: status.chssupplementstat_id,
                date_completed: status.date_completed || null,
              }
            : null;
        })
        .filter(Boolean); // Remove null entries (unchanged statuses)

      if (updates.length > 0) {
        try {
          await updateSupplementStatus(
            updates.filter(
              (
                update
              ): update is {
                chssupplementstat_id: number;
                date_completed: string | null;
              } => update !== null
            )
          );
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

export const useImmunizationChildHealthRecordMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChildHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["childHealthRecords"] }); // Update with your query key

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
