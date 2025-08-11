import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamilyHealth, updateFamilyRoleHealth, updateHouseholdHealth, updateProfileHealth, updateWaterSupply, updateSanitaryFacility, updateSolidWaste, updateSurveyIdentification } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useUpdateHouseholdHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdInfo: Record<string, any>) => updateHouseholdHealth(householdInfo), 
    onSuccess: () => {
      toast("Record updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });

      queryClient.invalidateQueries({queryKey: ['householdsHealth']});
    }
  })
}


export const useUpdateFamilyRoleHealth = () => {
  return useMutation({
    mutationFn: ({ familyId, residentId, fc_role } : {
      familyId: string;
      residentId: string;
      fc_role: string | null;
    }) => updateFamilyRoleHealth(familyId, residentId, fc_role)
  })
}
export const useUpdateProfileHealth = () => {
  return useMutation({
    mutationFn: ({ personalId, values} : { 
      personalId: string;
      values: Record<string, any>;
    }) => updateProfileHealth(personalId, values),
  });
};

export const useUpdateFamilyHealth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({data, familyId} : {
      data: Record<string, any>;
      familyId: string;
      oldHouseholdId?: string;
    }) => updateFamilyHealth(data, familyId),
    onSuccess: (newData, variables) => {
      const { data, familyId, oldHouseholdId} = variables;

      // Update families list
      queryClient.setQueryData(['familiesHealth'], (old: any[] = []) => (
        old.map(family => {
          if(family.fam_id === familyId) {
            return {
              ...(family || []),
              fam_building: data.building,
              fam_indigenous: data.indigenous,
              hh: {
                ...family.hh,
                hh_id: data.householdNo
              }
            }
          }
          return family
        })
      ))

      queryClient.setQueryData(['householdsHealth'], (old: any[] = []) => (
        old.map(house => {
          // Remove the family from previous household
          if(house.hh_id === oldHouseholdId) {
            return {
              ...(house || []),
              family: house.family.filter((fam: any) => (
                fam.fam_id !== familyId
              ))
            }
          }

          // Transfer to new household
          if(house.hh_id === data.householdNo) { 
            return {
              ...(house || []),
              family: [
                ...(house.family || []),
                newData
              ]
            }
          }
          return house;
        })
      ))

      queryClient.invalidateQueries({queryKey: ['householdsHealth']});
      queryClient.invalidateQueries({queryKey: ['familiesHealth']});
    }
  })
}

// Environmental updates
export const useUpdateWaterSupply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ water_sup_id, data }: { water_sup_id: string; data: { water_sup_type?: string; water_conn_type?: string; water_sup_desc?: string } }) =>
      updateWaterSupply(water_sup_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterSupplyList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Water supply updated", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

export const useUpdateSanitaryFacility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sf_id, data }: { sf_id: string; data: { sf_type?: string; sf_toilet_type?: string } }) =>
      updateSanitaryFacility(sf_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sanitaryFacilityList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Sanitary facility updated", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

export const useUpdateSolidWaste = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ swm_id, data }: { swm_id: string; data: { swn_desposal_type?: string; swm_desc?: string } }) =>
      updateSolidWaste(swm_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solidWasteList'] });
      queryClient.invalidateQueries({ queryKey: ['environmentalData'] });
      toast("Solid waste updated", { icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> });
    }
  });
};

// ================ SURVEY IDENTIFICATION ================ (Status: Completed)
export const useUpdateSurveyIdentification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ si_id, data }: { 
      si_id: string; 
      data: { 
        si_filled_by?: string; 
        si_informant?: string; 
        si_checked_by?: string; 
        si_date?: string; 
        si_signature?: string;
        fam_id?: string;
      } 
    }) => updateSurveyIdentification(si_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationList'] });
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationByFamily'] });
      queryClient.invalidateQueries({ queryKey: ['surveyIdentificationFormData'] });
      toast("Survey identification updated", { 
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" /> 
      });
    }
  });
};