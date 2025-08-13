import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addVaccine,
  addVaccineIntervals,
  addRoutineFrequency,
  addconvaccine,
  VaccineType,
} from "../../restful-api/Antigen/VaccinePostAPI";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { useNavigate } from "react-router";

export const useAddVaccine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      vac_type_choices: string;
      vac_name: string;
      no_of_doses: number;
      ageGroup: number;
    }) => addVaccine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useAddVaccineIntervals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      vac_id: number;
      dose_number: number;
      interval: number;
      time_unit: string;
    }) => addVaccineIntervals(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useAddRoutineFrequency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      vac_id: number;
      dose_number: number;
      interval: number;
      time_unit: string;
    }) => addRoutineFrequency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

// NEW mutation that encapsulates the entire submission flow
export const useSubmitVaccine = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addVaccineMutation = useAddVaccine();
  const addVaccineIntervalsMutation = useAddVaccineIntervals();
  const addRoutineFrequencyMutation = useAddRoutineFrequency();

  return useMutation({
    mutationFn: async (formData: VaccineType) => {
      if (!formData.vaccineName || !formData.ageGroup) {
        throw new Error("Vaccine name and age group are required");
      }

      const ageGroupToUse = formData.ageGroup.split(",")[0];

      // Fetch existing vaccines to check for duplicates
      // Add vaccine
      const vaccineResponse = await addVaccineMutation.mutateAsync({
        vac_type_choices: formData.type,
        vac_name: formData.vaccineName,
        no_of_doses: Number(formData.noOfDoses) || 0,
        ageGroup: Number(ageGroupToUse),
        // specify_age: formData.ageGroup === "0-5" ? String(formData.specifyAge || "") : formData.ageGroup,
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
          (formData.intervals || []).map((interval, i) =>
            addVaccineIntervalsMutation.mutateAsync({
              vac_id: vaccineId,
              dose_number: i + 2,
              interval: Number(interval),
              time_unit: formData.timeUnits?.[i] || "months",
            })
          )
        );
      } else if (formData.routineFrequency) {
        await addRoutineFrequencyMutation.mutateAsync({
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
      navigate(-1);
      toast("Vaccine saved successfully!", {
        icon: <CircleCheck className="text-green-500" />,
      });
    },
    onError: (error: Error) => {
      toast("Failed to save vaccine", {
        icon: <CircleX className="text-red-500" />,
        description: error.message,
      });
    },
  });
};
