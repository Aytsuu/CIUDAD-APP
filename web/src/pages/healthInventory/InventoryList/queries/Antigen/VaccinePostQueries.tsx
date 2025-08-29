import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addVaccine,
  addVaccineIntervals,
  addRoutineFrequency,
  addconvaccine,
} from "../../restful-api/Antigen/postAPI";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { useNavigate } from "react-router";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";


export const useSubmitVaccine = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: async (formData: any) => {
      if (!formData.vaccineName || !formData.ageGroup) {
        throw new Error("Vaccine name and age group are required");
      }

      const ageGroupToUse = formData.ageGroup.split(",")[0];

      // Add vaccine
      const vaccineResponse = await addVaccine({
        vac_type_choices: formData.type,
        vac_name: formData.vaccineName,
        no_of_doses: Number(formData.noOfDoses) || 0,
        ageGroup: Number(ageGroupToUse),
      });

      if (!vaccineResponse?.vac_id) {
        throw new Error("Failed to create vaccine record");
      }

      const vaccineId = vaccineResponse.vac_id;

      if (formData.type === "conditional") {
        const convaccineResponse = await addconvaccine(vaccineId);

        if (!convaccineResponse?.vac_id) {
          throw new Error("Failed to create conditional vaccine record");
        }
      }
      // Handle intervals based on vaccine type
      else if (formData.type === "primary") {
        await Promise.all(
          (formData.intervals || []).map((interval:any, i:any) =>
            addVaccineIntervals({
              vac_id: vaccineId,
              dose_number: i + 2,
              interval: Number(interval),
              time_unit: formData.timeUnits?.[i] || "months",
            })
          )
        );
      } else if (formData.routineFrequency) {
        await addRoutineFrequency({
          vac_id: vaccineId,
          dose_number: 1,
          interval: Number(formData.routineFrequency.interval),
          time_unit: formData.routineFrequency.unit,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
      queryClient.invalidateQueries({ queryKey: ["Antigen"] });

      return vaccineResponse;
    },
    onSuccess: () => {
      showSuccessToast("Saved successfully!");
    },
    onError: () => {
      showErrorToast("Failed to save ");
    },
  });
};
