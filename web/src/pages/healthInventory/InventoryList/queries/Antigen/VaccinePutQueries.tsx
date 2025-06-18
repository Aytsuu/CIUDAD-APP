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
        const hasTypeChanged = formData.type !== vaccineData.vaccineType.toLowerCase();
        const hasDosesChanged = 
          Number(formData.noOfDoses) !== 
          Number(vaccineData.noOfDoses === "N/A" ? 1 : vaccineData.noOfDoses);
        const hasSpecifyAgeChanged = formData.specifyAge !== vaccineData.specifyAge;
        const hasRoutineIntervalChanged = 
          formData.type === "routine" &&
          (Number(formData.routineFrequency?.interval) !== vaccineData.doseDetails[0]?.interval ||
           formData.routineFrequency?.unit !== vaccineData.doseDetails[0]?.unit);
  
        const shouldUpdateIntervals = 
          hasTypeChanged || 
          hasDosesChanged || 
          hasSpecifyAgeChanged || 
          hasRoutineIntervalChanged;
  
        // First update the main vaccine details
        await updateDetailsMutation.mutateAsync({ 
          vaccineId: vaccineData.id, 
          formData 
        });
  
        if (shouldUpdateIntervals) {
          // If type changed, we need to clean up the old intervals
          if (hasTypeChanged) {
            if (vaccineData.vaccineType.toLowerCase() === "routine") {
              // Delete all existing routine frequencies
              await deleteRoutineMutation.mutateAsync(vaccineData.id);
            } else {
              // Delete all existing vaccine intervals
              await deleteIntervalsMutation.mutateAsync(vaccineData.id);
            }
          }
  
          // Now create/update the new intervals based on current type
          if (formData.type === "routine") {
            // For routine vaccines, update/create the single frequency
            await updateRoutineMutation.mutateAsync({ 
              vaccineId: vaccineData.id, 
              formData 
            });
          } else {
            // For non-routine vaccines, update/create all dose intervals
            await updateIntervalsMutation.mutateAsync({ 
              vaccineId: vaccineData.id, 
              formData 
            });
          }
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
        updateIntervalsMutation.isPending
    };
  };