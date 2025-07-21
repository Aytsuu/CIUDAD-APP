import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFamily, updateFamilyRole, updateHousehold, updateProfile } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

export const useUpdateHousehold = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (householdInfo: Record<string, any>) => updateHousehold(householdInfo), 
    onSuccess: () => {
      toast("Record updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
      });

      queryClient.invalidateQueries({queryKey: ['households']});
    }
  })
}


export const useUpdateFamilyRole = () => {
  return useMutation({
    mutationFn: ({ familyId, residentId, fc_role } : {
      familyId: string;
      residentId: string;
      fc_role: string | null;
    }) => updateFamilyRole(familyId, residentId, fc_role)
  })
}
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: ({ personalId, values} : { 
      personalId: string;
      values: Record<string, any>;
    }) => updateProfile(personalId, values),
  });
};

export const useUpdateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({data, familyId} : {
      data: Record<string, any>;
      familyId: string;
      oldHouseholdId?: string;
    }) => updateFamily(data, familyId),
    onSuccess: (newData, variables) => {
      const { data, familyId, oldHouseholdId} = variables;

      // Update families list
      queryClient.setQueryData(['families'], (old: any[] = []) => (
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

      queryClient.setQueryData(['households'], (old: any[] = []) => (
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

      queryClient.invalidateQueries({queryKey: ['households']});
      queryClient.invalidateQueries({queryKey: ['families']});
    }
  })
}