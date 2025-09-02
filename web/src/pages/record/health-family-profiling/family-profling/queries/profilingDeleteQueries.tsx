import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteFamilyComposition, deleteWaterSupply, deleteSanitaryFacility, deleteSolidWaste, deleteSurveyIdentification } from "../restful-api/profilingDeleteAPI"
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { api } from "@/api/api";

export const useDeleteRequest = () => {
  return useMutation({
    mutationFn: async (requestId: string) => {
      try {
        const res = await api.delete(`profiling/request/delete/${requestId}/`);
        return res;
      } catch (err) {
        console.error(err);
      }
    }
  })
}

export const useDeleteFamilyComposition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({familyId, residentId} : {
      familyId: string
      residentId: string
    }) => deleteFamilyComposition(familyId, residentId),
    onSuccess: (_, variables) => {
      const {familyId, residentId} = variables;

      queryClient.setQueryData(['families'], (old: any[] = []) => {
        return old.map(family => {
          if (family.fam_id === familyId) {
            return {
              ...family,
              family_compositions: family.family_compositions.filter(
                (fc: any) => fc.rp.rp_id !== residentId
              )
            };
          }
          return family;
        });
      });

      // Update the resident if needed (remove the family connection)
      queryClient.setQueryData(['residents'], (old: any[] = []) => {
        return old.map(resident => {
          if(resident.rp_id === residentId) {
            return {
              ...resident,
              family_compositions: []
            }
          }
          return resident;
        })
      });

      queryClient.invalidateQueries({queryKey: ['familyCompositions']});
      queryClient.invalidateQueries({queryKey: ['families']});
      queryClient.invalidateQueries({queryKey: ['residents']});
    }
  })
}

// Environmental deletes
export const useDeleteWaterSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (water_sup_id: string) => deleteWaterSupply(water_sup_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterSupplyList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Water supply deleted", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

export const useDeleteSanitaryFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sf_id: string) => deleteSanitaryFacility(sf_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanitaryFacilityList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Sanitary facility deleted", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

export const useDeleteSolidWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (swm_id: string) => deleteSolidWaste(swm_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solidWasteList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Solid waste deleted", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

// ================ SURVEY IDENTIFICATION ================ (Status: Completed)
export const useDeleteSurveyIdentification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (si_id: string) => deleteSurveyIdentification(si_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationList'] });
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationByFamily'] });
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationFormData'] });
      toast("Survey identification deleted", { 
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> 
      });
    }
  });
};