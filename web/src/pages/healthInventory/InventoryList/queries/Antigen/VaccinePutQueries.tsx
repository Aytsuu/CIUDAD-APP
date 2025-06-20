import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    updateVaccineDetails,
    deleteRoutineFrequencies,
    deleteVaccineIntervals,
    updateRoutineFrequency,
    updateVaccineIntervals
  } from '../../restful-api/Antigen/VaccinePutAPI';
import { VaccineData } from "../../editListModal/EditVaccineModal";
import {
    VaccineType,
  } from "@/form-schema/inventory/lists/inventoryListSchema";
  


export const useUpdateVaccineDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vaccineId, formData }: { vaccineId: number; formData: any }) => 
      updateVaccineDetails(vaccineId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useDeleteRoutineFrequencies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vaccineId: number) => deleteRoutineFrequencies(vaccineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useDeleteVaccineIntervals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vaccineId: number) => deleteVaccineIntervals(vaccineId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useUpdateRoutineFrequency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vaccineId, formData }: { vaccineId: number; formData: any }) => 
      updateRoutineFrequency(vaccineId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};

export const useUpdateVaccineIntervals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vaccineId, formData }: { vaccineId: number; formData: any }) => 
      updateVaccineIntervals(vaccineId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
    },
  });
};


interface UpdateVaccineParams {
    formData: VaccineType;
    vaccineData: VaccineData;
  }
  export const useUpdateVaccine = () => {
    const queryClient = useQueryClient();
    const updateDetailsMutation = useUpdateVaccineDetails();
    const deleteRoutineMutation = useDeleteRoutineFrequencies();
    const deleteIntervalsMutation = useDeleteVaccineIntervals();
    const updateRoutineMutation = useUpdateRoutineFrequency();
    const updateIntervalsMutation = useUpdateVaccineIntervals();
  
    const updateVaccine = async ({ formData, vaccineData }: UpdateVaccineParams) => {
      try {
        console.log("Starting vaccine update with:", { formData, vaccineData });
  
        const hasTypeChanged = formData.type !== vaccineData.vaccineType.toLowerCase();
        const hasDosesChanged =
          Number(formData.noOfDoses) !==
          Number(vaccineData.noOfDoses === "N/A" ? 1 : vaccineData.noOfDoses);
  
        console.log("Change detection:", { hasTypeChanged, hasDosesChanged });
  
        // First update the main vaccine details
        await updateDetailsMutation.mutateAsync({
          vaccineId: vaccineData.id,
          formData,
        });
  
        // Handle interval updates based on type change or dose change
        if (hasTypeChanged || hasDosesChanged) {
          console.log("Type or doses changed - cleaning up old intervals");
  
          // Clean up old intervals based on previous type
          if (vaccineData.vaccineType.toLowerCase() === "routine") {
            console.log(`Deleting routine frequencies for vaccineId=${vaccineData.id}`);
            await deleteRoutineMutation.mutateAsync(vaccineData.id);
          } else {
            console.log(`Deleting vaccine intervals for vaccineId=${vaccineData.id}`);
            await deleteIntervalsMutation.mutateAsync(vaccineData.id);
          }
        }
  
        // Create/update intervals for current type
        if (formData.type === "routine") {
          console.log(`Updating routine frequency for vaccineId=${vaccineData.id}`);
          await updateRoutineMutation.mutateAsync({
            vaccineId: vaccineData.id,
            formData,
          });
        } else {
          console.log(`Updating vaccine intervals for vaccineId=${vaccineData.id}`);
          await updateIntervalsMutation.mutateAsync({
            vaccineId: vaccineData.id,
            formData,
          });
        }
  
        // Invalidate queries to refresh the data
        queryClient.invalidateQueries({ queryKey: ["vaccines"] });
  
        return { success: true };
      } catch (error: any) {
        console.error("Update error:", error);
        throw new Error(error.message || "Failed to update vaccine");
      }
    };
  
    return {
      updateVaccine,
      isUpdating:
        updateDetailsMutation.isPending ||
        deleteRoutineMutation.isPending ||
        deleteIntervalsMutation.isPending ||
        updateRoutineMutation.isPending ||
        updateIntervalsMutation.isPending,
    };
  };