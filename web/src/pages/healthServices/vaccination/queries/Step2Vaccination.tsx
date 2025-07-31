// Create a new file, e.g., useVaccinationMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import {createVitalSigns} from "../restful-api/post";
import {updateVaccinationHistory} from "../restful-api/update";
import { getVaccineStock } from "@/pages/healthServices/vaccination/restful-api/get";
import { deleteVitalSigns } from "@/pages/healthServices/vaccination/restful-api/delete";
import { toast } from "sonner";

export const useStep2VaccinationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, params }: { data: any; params: any }) => {
      const { vacStck_id, vachist_id } = params;

      if (!vachist_id) {
        throw new Error("No vaccination record ID provided");
      }

      let vital_id: number | null = null;

      try {
        // Create vital signs
        const vitalSigns = await createVitalSigns({
          vital_bp_systolic: data.bpsystolic,
          vital_bp_diastolic: data.bpdiastolic,
          vital_temp: data.temp,
          vital_o2: data.o2,
          vital_pulse: data.pr,
        });

        vital_id = vitalSigns?.vital_id;
        if (!vital_id) {
          throw new Error("Failed to retrieve vital signs ID from response");
        }

        // Update vaccine stock
        const vaccineData = await getVaccineStock(vacStck_id);
        if (!vacStck_id) {
          throw new Error("Vaccine ID is missing");
        }

        await api2.put(`inventory/vaccine_stocks/${parseInt(vacStck_id)}/`, {
          vacStck_qty_avail: vaccineData.vacStck_qty_avail - 1,
        });

        // Update vaccination history
        await updateVaccinationHistory(
          vachist_id,
          "scheduled",
          vital_id
        );

        return { success: true };
      } catch (error) {
        // Rollback if error occurs
        if (vital_id) {
          await deleteVitalSigns(String(vital_id));
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Vaccination record updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vaccinationRecords'] });
    },
    onError: (error) => {
      console.error("Failed to save vaccination record:", error);
      toast.error("Failed to save vaccination record");
    }
  });
};