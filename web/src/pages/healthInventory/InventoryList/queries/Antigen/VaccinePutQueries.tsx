import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateVaccineDetails,
  updateRoutineFrequency,
  updateVaccineIntervals,
} from "../../restful-api/Antigen/putAPI";
import {deleteConditionalVacinne,deleteVaccineIntervals,deleteRoutineFrequencies} from "../../restful-api/Antigen/deleteAPI";
import { VaccineData } from "../../editListModal/EditVaccineModal";
import { VaccineType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { addconvaccine } from "../../restful-api/Antigen/postAPI";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { useNavigate } from "react-router";

// export const useUpdateVaccineDetails = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       vaccineId,
//       formData,
//     }: {
//       vaccineId: number;
//       formData: any;
//     }) => updateVaccineDetails(vaccineId, formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error updating vaccine details:", error);
//     },
//   });
// };

// export const useDeleteRoutineFrequencies = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (vaccineId: number) => deleteRoutineFrequencies(vaccineId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error deleting routine frequencies:", error);
//     },
//   });
// };

// export const useDeleteVaccineIntervals = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (vaccineId: number) => deleteVaccineIntervals(vaccineId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error deleting vaccine intervals:", error);
//     },
//   });
// };

// export const useUpdateRoutineFrequency = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       vaccineId,
//       formData,
//     }: {
//       vaccineId: number;
//       formData: any;
//     }) => updateRoutineFrequency(vaccineId, formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error updating routine frequency:", error);
//     },
//   });
// // };

// export const useUpdateVaccineIntervals = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({
//       vaccineId,
//       formData,
//     }: {
//       vaccineId: number;
//       formData: any;
//     }) => updateVaccineIntervals(vaccineId, formData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error updating vaccine intervals:", error);
//     },
//   });
// };

// export const useDeleteConditionalVacinne = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (vaccineId: number) => deleteConditionalVacinne(vaccineId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error deleting conditional vaccine:", error);
//     },
//   });
// };

// export const useUpdateConditionalVaccine = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (vaccineId: number) => updateConditionalVaccine(vaccineId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["vaccines"] });
//     },
//     onError: (error) => {
//       console.error("Error updating conditional vaccine:", error);
//     },
//   });
// };

interface UpdateVaccineParams {
  formData: VaccineType;
  vaccineData: VaccineData;
}

export const useUpdateVaccine = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // const updateDetailsMutation = useUpdateVaccineDetails();
  // const deleteRoutineMutation = useDeleteRoutineFrequencies();
  // const deleteIntervalsMutation = useDeleteVaccineIntervals();
  // const updateRoutineMutation = useUpdateRoutineFrequency();
  // const updateIntervalsMutation = useUpdateVaccineIntervals();
  // const deleteConvaccinationMutation = useDeleteConditionalVacinne();

  return useMutation({
    mutationFn: async ({ formData, vaccineData }: UpdateVaccineParams) => {
      const hasTypeChanged =
        formData.type !== vaccineData.vaccineType.toLowerCase();
      const hasDosesChanged =
        Number(formData.noOfDoses) !==
        Number(vaccineData.noOfDoses === "N/A" ? 1 : vaccineData.noOfDoses);

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
        await updateRoutineFrequency(
          vaccineData.id,
          formData
        );
      } else {
        await updateVaccineIntervals(vaccineData.id, formData);
      
      }
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
      queryClient.invalidateQueries({ queryKey: ["Antigen"] });

      return;
    },
    onSuccess: () => {
      navigate(-1);
      toast("Vaccine updated successfully!", {
        icon: <CircleCheck className="text-green-500" />,
      });
    },
    onError: (error: Error) => {
      toast("Failed to update vaccine", {
        icon: <CircleX className="text-red-500" />,
        description: error.message,
      });
    },
  });
};
