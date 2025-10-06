// Create a new file, e.g., useVaccinationMutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVitalSigns } from "../restful-api/post";
import { updateVaccinationHistory } from "../restful-api/update";
import { deleteVitalSigns } from "@/pages/healthServices/vaccination/restful-api/delete";
import { toast } from "sonner";

export const useStep2VaccinationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, params,staff_id }: { data: any; params: any ,staff_id:string}) => {

      if (!params?.vachist_id) {
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
          vital_RR: data.respiratoryRate,
          patrec: params?.patrec_id,
          staff: staff_id || null,
        });

        vital_id = vitalSigns?.vital_id;
        if (!vital_id) {
          throw new Error("Failed to retrieve vital signs ID from response");
        }


        // Update vaccination history
        await updateVaccinationHistory({vachist_id:params?.vachist_id, vachist_status:"in queue", vital: vital_id});

        return { success: true };
      } catch (error) {
        // Rollback if error occurs
        if (vital_id) {
          await deleteVitalSigns(String(vital_id));
          await updateVaccinationHistory({vachist_id:params?.vachist_id, vachist_status:"forwarded"});
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Vaccination record updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vaccinationRecords"] });
    },
    onError: (error) => {
      console.error("Failed to save vaccination record:", error);
      toast.error("Failed to save vaccination record");
    },
  });
};
