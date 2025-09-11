import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateImzSuppliesList } from "../../restful-api/Antigen/put-api";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { updateVaccineDetails, updateRoutineFrequency, updateVaccineIntervals } from "../../restful-api/Antigen/put-api";
import { deleteConditionalVacinne, deleteVaccineIntervals, deleteRoutineFrequencies } from "../../restful-api/Antigen/delete-api";
import { addconvaccine } from "../../restful-api/Antigen/post-api";

export const useUpdateImzSupply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ imz_id, imz_name }: { imz_id: number; imz_name: string }) => updateImzSuppliesList(imz_id, imz_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ImzSupplies"] });
      showSuccessToast("updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error updating IMZ supply:", error);
      showErrorToast("Failed to update  ");
    }
  });
};

export const useUpdateVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, vaccineData }: any) => {
      const hasTypeChanged = formData.type !== vaccineData.vaccineType.toLowerCase();
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
        await updateRoutineFrequency(vaccineData.id, formData);
      } else {
        await updateVaccineIntervals(vaccineData.id, formData);
      }
      queryClient.invalidateQueries({ queryKey: ["VaccineListCombine"] });

      return;
    },
    onSuccess: () => {
      showSuccessToast(" updated successfully!");
    },
    onError: () => {
      showErrorToast("Failed to update vaccine");
    }
  });
};
