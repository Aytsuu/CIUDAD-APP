import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBusiness, updateFamily, updateFamilyRole, updateHousehold, updateProfile } from "../restful-api/profilingPutAPI";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { api } from "@/api/api";

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ personalId, values} : { 
      personalId: string;
      values: Record<string, any>;
    }) => updateProfile(personalId, values),
    onSuccess: (variables) => {
      const { per_id } = variables;
      queryClient.invalidateQueries({queryKey: ['personalInfo', per_id]});
      queryClient.invalidateQueries({queryKey: ['personalHistory', per_id]});
    }
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

export const useUpdateBusiness = () => {
  const queryclient = useQueryClient();
  return useMutation({
    mutationFn: ({data, businessId} : {
      data: Record<string, any>;
      businessId: string;
    }) => updateBusiness(data, businessId),
    onSuccess: (newData) => {
      queryclient.setQueryData(['businessInfo'], (old: any) => ({
        ...(old || {}),
        ...newData
      }));

      queryclient.invalidateQueries({queryKey: ['businesses']});
      queryclient.invalidateQueries({queryKey: ['businessInfo']});
    }
  })
}


export const useUpdateAccount = () => {
  return useMutation({
    mutationFn: async ({accNo, data} : {
        accNo: number, 
        data: Record<string, any>
      }) => {
      try {
        const res = await api.put(`account/${accNo}/`, data);
        return res.data
      } catch (err) {
        throw err;
      }
    }
  })
}