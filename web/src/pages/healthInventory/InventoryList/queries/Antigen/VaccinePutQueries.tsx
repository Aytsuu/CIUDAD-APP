import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateVaccineDetails,
  updateRoutineFrequency,
  updateVaccineIntervals,
} from "../../restful-api/Antigen/putAPI";
import {deleteConditionalVacinne,deleteVaccineIntervals,deleteRoutineFrequencies} from "../../restful-api/Antigen/deleteAPI";
import { addconvaccine } from "../../restful-api/Antigen/postAPI";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

export const useUpdateVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, vaccineData }: any) => {
      const hasTypeChanged =
        formData.type !== vaccineData.vaccineType.toLowerCase();
        const hasDosesChanged = Number(formData.noOfDoses) !== Number(vaccineData.noOfDoses === "N/A" ? 1 : vaccineData.noOfDoses);

      // First update the main vaccine details
      await updateVaccineDetails(vaccineData.id, formData);

      // Handle interval updates based on type change or dose change
      if (hasTypeChanged || hasDosesChanged) {
        if (vaccineData.vaccineType.toLowerCase() === "conditional") {
          await deleteConditionalVacinne(vaccineData.id);
        } else if (vaccineData.vaccineType.toLowerCase() === "routine") {
          await deleteRoutineFrequencies(vaccineData.id);
        } else {
          await deleteVaccineIntervals(vaccineData.id);
        }
      }

      // Handle new intervals based on updated type
      if (formData.type === "conditional") {
        const res = await addconvaccine(vaccineData.id);
        if (!res?.vac_id) {
          throw new Error("Failed to create conditional vaccine record");
        }
      } else if (formData.type === "routine") {
        await updateRoutineFrequency( vaccineData.id, formData);
      } else {
        await updateVaccineIntervals(vaccineData.id, formData);
      
      }
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
      queryClient.invalidateQueries({ queryKey: ["Antigen"] });

      return;
    },
    onSuccess: () => {
      showSuccessToast(" updated successfully!");
    },
    onError: () => {
      showErrorToast("Failed to update vaccine");
    },
  });
};
